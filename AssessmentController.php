<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Assessment;
use App\Models\AssessmentResult;
use App\Models\TrainingAssignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AssessmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Assessment::with(['training', 'creator']);

        if ($request->filled('training_id')) {
            $query->where('training_id', $request->training_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('title', 'like', "%{$search}%");
        }

        $sortField = $request->sort_by ?? 'created_at';
        $sortOrder = $request->sort_order ?? 'desc';
        $allowedSorts = ['title', 'total_marks', 'status', 'created_at'];
        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortOrder === 'asc' ? 'asc' : 'desc');
        }

        $perPage = $request->per_page ?? 10;
        $assessments = $query->paginate($perPage);

        return response()->json([
            'data' => $assessments->items(),
            'meta' => [
                'current_page' => $assessments->currentPage(),
                'last_page' => $assessments->lastPage(),
                'total' => $assessments->total(),
                'per_page' => $assessments->perPage(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'training_id' => 'required|exists:trainings,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'total_marks' => 'required|integer|min:1',
            'passing_marks' => 'required|integer|min:1|lte:total_marks',
            'status' => 'nullable|in:Draft,Published,Closed',
        ]);

        $validated['created_by'] = Auth::id();

        $assessment = Assessment::create($validated);
        $assessment->load(['training', 'creator']);

        return response()->json(['message' => 'Assessment created successfully', 'data' => $assessment], 201);
    }

    public function show($id)
    {
        $assessment = Assessment::with(['training', 'creator', 'results.employee.user'])->findOrFail($id);

        $assessment->results_count = $assessment->results->count();
        $assessment->average_marks = $assessment->results->avg('marks_obtained');

        return response()->json(['data' => $assessment]);
    }

    public function update(Request $request, $id)
    {
        $assessment = Assessment::findOrFail($id);

        $validated = $request->validate([
            'training_id' => 'sometimes|required|exists:trainings,id',
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'total_marks' => 'sometimes|required|integer|min:1',
            'passing_marks' => 'sometimes|required|integer|min:1|lte:total_marks',
            'status' => 'sometimes|in:Draft,Published,Closed',
        ]);

        $assessment->update($validated);
        $assessment->load(['training', 'creator']);

        return response()->json(['message' => 'Assessment updated successfully', 'data' => $assessment]);
    }

    public function destroy($id)
    {
        $assessment = Assessment::findOrFail($id);
        $assessment->delete();
        return response()->json(['message' => 'Assessment deleted successfully']);
    }

    public function results($assessmentId)
    {
        $results = AssessmentResult::with(['employee.user'])
            ->where('assessment_id', $assessmentId)
            ->get();

        return response()->json(['data' => $results]);
    }

    public function storeResult(Request $request)
    {
        $validated = $request->validate([
            'assessment_id' => 'required|exists:assessments,id',
            'employee_id' => 'required|exists:employees,id',
            'marks_obtained' => 'required|integer|min:0',
            'remarks' => 'nullable|string',
        ]);

        $assessment = Assessment::findOrFail($validated['assessment_id']);

        if ($validated['marks_obtained'] > $assessment->total_marks) {
            return response()->json(['message' => 'Marks obtained cannot exceed total marks'], 422);
        }

        $result = AssessmentResult::updateOrCreate(
            [
                'assessment_id' => $validated['assessment_id'],
                'employee_id' => $validated['employee_id'],
            ],
            [
                'marks_obtained' => $validated['marks_obtained'],
                'remarks' => $validated['remarks'] ?? null,
            ]
        );

        $passed = $result->marks_obtained >= $assessment->passing_marks;
        $trainingId = $assessment->training_id;

        if ($passed) {
            $assignment = TrainingAssignment::where('training_id', $trainingId)
                ->where('employee_id', $validated['employee_id'])
                ->first();

            if ($assignment) {
                $assignment->update(['progress' => 100, 'status' => 'Completed']);
            }
        }

        $result->load(['employee.user']);

        return response()->json([
            'message' => 'Result saved successfully',
            'data' => $result,
            'passed' => $passed,
        ], 201);
    }

    public function updateResult(Request $request, $id)
    {
        $result = AssessmentResult::findOrFail($id);

        $validated = $request->validate([
            'marks_obtained' => 'sometimes|required|integer|min:0',
            'remarks' => 'nullable|string',
        ]);

        $assessment = $result->assessment;

        if (isset($validated['marks_obtained']) && $validated['marks_obtained'] > $assessment->total_marks) {
            return response()->json(['message' => 'Marks obtained cannot exceed total marks'], 422);
        }

        $result->update($validated);
        $result->load(['employee.user']);

        return response()->json(['message' => 'Result updated successfully', 'data' => $result]);
    }

    public function myAssessments()
    {
        $user = Auth::user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json(['data' => []]);
        }

        $assessments = Assessment::with(['training', 'results' => function ($q) use ($employee) {
            $q->where('employee_id', $employee->id);
        }])
        ->whereHas('training.assignments', function ($q) use ($employee) {
            $q->where('employee_id', $employee->id);
        })
        ->where('status', 'Published')
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json(['data' => $assessments]);
    }
}
