<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\DocumentLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    public function index(Request $request)
    {
        $query = Document::with(['employee.user', 'category', 'verifiedBy']);

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }
        if ($request->has('category_id') && $request->category_id) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->has('employee_id') && $request->employee_id) {
            $query->where('employee_id', $request->employee_id);
        }

        $documents = $query->orderBy('created_at', 'desc')->get();
        return response()->json(['data' => $documents]);
    }

    public function myDocuments()
    {
        $user = Auth::user();
        if (!$user || !$user->employee) {
            return response()->json(['message' => 'Employee profile not found'], 404);
        }

        $documents = Document::with(['category', 'logs.performer'])
            ->where('employee_id', $user->employee->id)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json(['data' => $documents]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:document_categories,id',
            'title' => 'required|string|max:255',
            'document_number' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'issue_date' => 'nullable|date',
            'expiry_date' => 'nullable|date|after_or_equal:issue_date',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:5120',
        ]);

        $user = Auth::user();
        
        // If employee is uploading, set their employee_id. Admin/HR might specify an employee_id
        if ($user->role === 'employee') {
            if (!$user->employee) return response()->json(['message' => 'No employee profile'], 404);
            $validated['employee_id'] = $user->employee->id;
            $validated['status'] = 'Pending';
        } else {
            $validated['employee_id'] = $request->employee_id; // could be null for company document
            $validated['status'] = 'Approved';
            $validated['verified_by'] = $user->id;
            $validated['verified_at'] = now();
        }

        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('documents', 'public');
            $validated['file_path'] = $path;
        }

        $document = Document::create($validated);

        DocumentLog::create([
            'document_id' => $document->id,
            'action' => 'Uploaded',
            'performed_by' => $user->id,
            'remarks' => 'Document uploaded by ' . $user->name
        ]);

        return response()->json(['message' => 'Document uploaded successfully', 'data' => $document], 201);
    }

    public function show($id)
    {
        $document = Document::with(['employee.user', 'category', 'logs.performer'])->findOrFail($id);
        
        // Ensure employee can only view their own
        if (Auth::user()->role === 'employee') {
            if ($document->employee_id !== Auth::user()->employee->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }
        
        return response()->json(['data' => $document]);
    }

    public function update(Request $request, $id)
    {
        // Admin/HR can update document info
        $document = Document::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'document_number' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'issue_date' => 'nullable|date',
            'expiry_date' => 'nullable|date',
        ]);

        $document->update($validated);

        DocumentLog::create([
            'document_id' => $document->id,
            'action' => 'Updated',
            'performed_by' => Auth::id(),
            'remarks' => 'Document info updated'
        ]);

        return response()->json(['message' => 'Document updated successfully', 'data' => $document]);
    }

    public function verify(Request $request, $id)
    {
        $document = Document::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:Approved,Rejected,Under Review',
            'verification_notes' => 'required|string'
        ]);

        $document->status = $validated['status'];
        $document->verification_notes = $validated['verification_notes'];
        
        if ($validated['status'] === 'Approved') {
            $document->verified_by = Auth::id();
            $document->verified_at = now();
        }

        $document->save();

        DocumentLog::create([
            'document_id' => $document->id,
            'action' => $validated['status'],
            'performed_by' => Auth::id(),
            'remarks' => $validated['verification_notes']
        ]);

        return response()->json(['message' => 'Document verification updated', 'data' => $document]);
    }

    public function destroy($id)
    {
        $document = Document::findOrFail($id);
        
        if ($document->file_path) {
            Storage::disk('public')->delete($document->file_path);
        }
        
        $document->delete();
        return response()->json(['message' => 'Document deleted']);
    }

    public function download($id)
    {
        $document = Document::findOrFail($id);

        // Access check
        if (Auth::user()->role === 'employee') {
            if ($document->employee_id !== Auth::user()->employee->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        if (!Storage::disk('public')->exists($document->file_path)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        return Storage::disk('public')->download($document->file_path, $document->title);
    }

    public function dashboardStats()
    {
        $total = Document::count();
        $expired = Document::where('status', 'Expired')->count();
        $pending = Document::where('status', 'Pending')->count();
        $verified = Document::where('status', 'Approved')->count();
        $employeeUploaded = Document::whereNotNull('employee_id')->count();

        return response()->json([
            'total' => $total,
            'expired' => $expired,
            'pending_verification' => $pending,
            'verified' => $verified,
            'employee_uploaded' => $employeeUploaded
        ]);
    }
}
