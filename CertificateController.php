<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\Training;
use App\Models\TrainingAssignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class CertificateController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = Certificate::with(['employee.user', 'training', 'issuer']);

        if ($user->role === 'employee') {
            $employee = $user->employee;
            if ($employee) {
                $query->where('employee_id', $employee->id);
            } else {
                return response()->json(['data' => [], 'meta' => ['total' => 0]]);
            }
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('training_id')) {
            $query->where('training_id', $request->training_id);
        }

        $sortField = $request->sort_by ?? 'created_at';
        $sortOrder = $request->sort_order ?? 'desc';
        $allowedSorts = ['title', 'status', 'issued_date', 'created_at'];
        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortOrder === 'asc' ? 'asc' : 'desc');
        }

        $perPage = $request->per_page ?? 10;
        $certificates = $query->paginate($perPage);

        return response()->json([
            'data' => $certificates->items(),
            'meta' => [
                'current_page' => $certificates->currentPage(),
                'last_page' => $certificates->lastPage(),
                'total' => $certificates->total(),
                'per_page' => $certificates->perPage(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'training_id' => 'nullable|exists:trainings,id',
            'employee_id' => 'required|exists:employees,id',
            'title' => 'required|string|max:255',
            'file_path' => 'nullable|file|mimes:pdf,png,jpg,jpeg|max:10240',
            'issued_date' => 'nullable|date',
            'status' => 'nullable|in:Pending,Issued,Revoked',
        ]);

        if ($request->hasFile('file_path')) {
            $validated['file_path'] = $request->file('file_path')->store('training/certificates', 'public');
        }

        $validated['issued_by'] = Auth::id();

        $certificate = Certificate::create($validated);
        $certificate->load(['employee.user', 'training', 'issuer']);

        return response()->json(['message' => 'Certificate created successfully', 'data' => $certificate], 201);
    }

    public function show($id)
    {
        $certificate = Certificate::with(['employee.user', 'training', 'issuer'])->findOrFail($id);
        return response()->json(['data' => $certificate]);
    }

    public function update(Request $request, $id)
    {
        $certificate = Certificate::findOrFail($id);

        $validated = $request->validate([
            'training_id' => 'nullable|exists:trainings,id',
            'employee_id' => 'sometimes|required|exists:employees,id',
            'title' => 'sometimes|required|string|max:255',
            'file_path' => 'nullable|file|mimes:pdf,png,jpg,jpeg|max:10240',
            'issued_date' => 'nullable|date',
            'status' => 'sometimes|in:Pending,Issued,Revoked',
        ]);

        if ($request->hasFile('file_path')) {
            if ($certificate->file_path) {
                Storage::disk('public')->delete($certificate->file_path);
            }
            $validated['file_path'] = $request->file('file_path')->store('training/certificates', 'public');
        }

        $certificate->update($validated);
        $certificate->load(['employee.user', 'training', 'issuer']);

        return response()->json(['message' => 'Certificate updated successfully', 'data' => $certificate]);
    }

    public function destroy($id)
    {
        $certificate = Certificate::findOrFail($id);
        if ($certificate->file_path) {
            Storage::disk('public')->delete($certificate->file_path);
        }
        $certificate->delete();
        return response()->json(['message' => 'Certificate deleted successfully']);
    }

    public function bulkIssue(Request $request)
    {
        $validated = $request->validate([
            'training_id' => 'required|exists:trainings,id',
            'employee_ids' => 'required|array',
            'employee_ids.*' => 'exists:employees,id',
            'issued_date' => 'nullable|date',
        ]);

        $training = Training::findOrFail($validated['training_id']);

        $issued = [];
        foreach ($validated['employee_ids'] as $employeeId) {
            $assignment = TrainingAssignment::where('training_id', $training->id)
                ->where('employee_id', $employeeId)
                ->where('status', 'Completed')
                ->first();

            if (!$assignment) continue;

            $cert = Certificate::firstOrCreate(
                [
                    'training_id' => $training->id,
                    'employee_id' => $employeeId,
                ],
                [
                    'title' => 'Certificate of Completion - ' . $training->title,
                    'issued_date' => $validated['issued_date'] ?? now()->toDateString(),
                    'status' => 'Issued',
                    'issued_by' => Auth::id(),
                ]
            );

            $issued[] = $cert;
        }

        return response()->json(['message' => 'Certificates issued successfully', 'data' => $issued], 201);
    }

    public function myCertificates()
    {
        $user = Auth::user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json(['data' => []]);
        }

        $certificates = Certificate::with(['training', 'issuer'])
            ->where('employee_id', $employee->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $certificates]);
    }

    public function download($id)
    {
        $certificate = Certificate::findOrFail($id);

        $user = Auth::user();
        if ($user->role === 'employee') {
            $employee = $user->employee;
            if (!$employee || $certificate->employee_id !== $employee->id) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
        }

        if (!$certificate->file_path || !Storage::disk('public')->exists($certificate->file_path)) {
            return response()->json(['message' => 'File not found.'], 404);
        }

        return Storage::disk('public')->download($certificate->file_path);
    }
}
