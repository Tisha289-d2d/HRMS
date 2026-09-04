<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ProjectTask;
use App\Models\Project;
use App\Models\ProjectMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProjectTaskController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = ProjectTask::with(['employee.user', 'creator', 'project']);

        if ($user->role === 'employee') {
            $employee = $user->employee;
            if ($employee) {
                $query->where('employee_id', $employee->id);
            } else {
                return response()->json(['data' => [], 'meta' => ['total' => 0]]);
            }
        }

        if ($request->filled('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $sortField = $request->sort_by ?? 'created_at';
        $sortOrder = $request->sort_order ?? 'desc';
        $allowedSorts = ['title', 'status', 'priority', 'due_date', 'created_at'];
        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortOrder === 'asc' ? 'asc' : 'desc');
        }

        $perPage = $request->per_page ?? 10;
        $tasks = $query->paginate($perPage);

        return response()->json([
            'data' => $tasks->items(),
            'meta' => [
                'current_page' => $tasks->currentPage(),
                'last_page' => $tasks->lastPage(),
                'total' => $tasks->total(),
                'per_page' => $tasks->perPage(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'employee_id' => 'required|exists:employees,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'status' => 'nullable|in:Pending,In Progress,Completed,Overdue',
            'priority' => 'nullable|in:Low,Medium,High,Critical',
            'progress' => 'nullable|integer|min:0|max:100',
        ]);

        $validated['created_by'] = Auth::id();

        $task = ProjectTask::create($validated);

        $this->updateProjectProgress($task->project_id);

        $task->load(['employee.user', 'creator', 'project']);

        return response()->json(['message' => 'Task created successfully', 'data' => $task], 201);
    }

    public function show($id)
    {
        $task = ProjectTask::with(['employee.user', 'creator', 'project'])->findOrFail($id);

        $user = Auth::user();
        if ($user->role === 'employee') {
            $employee = $user->employee;
            if (!$employee || $task->employee_id !== $employee->id) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
        }

        return response()->json(['data' => $task]);
    }

    public function update(Request $request, $id)
    {
        $task = ProjectTask::findOrFail($id);
        $user = Auth::user();

        if ($user->role === 'employee') {
            $employee = $user->employee;
            if (!$employee || $task->employee_id !== $employee->id) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }

            $validated = $request->validate([
                'status' => 'sometimes|in:Pending,In Progress,Completed',
                'progress' => 'sometimes|integer|min:0|max:100',
                'description' => 'nullable|string',
                'remarks' => 'nullable|string',
            ]);

            if (($validated['progress'] ?? $task->progress) >= 100) {
                $validated['status'] = 'Completed';
            } elseif (($validated['progress'] ?? $task->progress) > 0 && !isset($validated['status'])) {
                $validated['status'] = 'In Progress';
            }

            $task->update($validated);
        } else {
            $validated = $request->validate([
                'project_id' => 'sometimes|exists:projects,id',
                'employee_id' => 'sometimes|exists:employees,id',
                'title' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'due_date' => 'nullable|date',
                'status' => 'sometimes|in:Pending,In Progress,Completed,Overdue',
                'priority' => 'sometimes|in:Low,Medium,High,Critical',
                'progress' => 'sometimes|integer|min:0|max:100',
                'remarks' => 'nullable|string',
            ]);

            $task->update($validated);
        }

        $this->updateProjectProgress($task->project_id);

        $task->load(['employee.user', 'creator', 'project']);

        return response()->json(['message' => 'Task updated successfully', 'data' => $task]);
    }

    public function updateProgress(Request $request, $id)
    {
        $task = ProjectTask::findOrFail($id);
        $user = Auth::user();

        $employee = $user->employee;
        if (!$employee || $task->employee_id !== $employee->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'progress' => 'required|integer|min:0|max:100',
            'status' => 'sometimes|in:Pending,In Progress,Completed',
            'remarks' => 'nullable|string',
        ]);

        if ($validated['progress'] >= 100) {
            $validated['status'] = 'Completed';
        } elseif ($validated['progress'] > 0 && !isset($validated['status'])) {
            $validated['status'] = 'In Progress';
        }

        $task->update($validated);

        $this->updateProjectProgress($task->project_id);

        $task->load(['employee.user', 'creator', 'project']);

        return response()->json(['message' => 'Task progress updated', 'data' => $task]);
    }

    public function destroy($id)
    {
        $task = ProjectTask::findOrFail($id);
        $projectId = $task->project_id;
        $task->delete();

        $this->updateProjectProgress($projectId);

        return response()->json(['message' => 'Task deleted successfully']);
    }

    private function updateProjectProgress($projectId)
    {
        $project = Project::find($projectId);
        if (!$project) return;

        $totalTasks = ProjectTask::where('project_id', $projectId)->count();
        if ($totalTasks === 0) {
            $project->update(['progress_percentage' => 0]);
            return;
        }

        $completedTasks = ProjectTask::where('project_id', $projectId)
            ->where('status', 'Completed')
            ->count();

        $avgProgress = ProjectTask::where('project_id', $projectId)->avg('progress');

        $percentage = round(($completedTasks / $totalTasks) * 70 + ($avgProgress / 100) * 30);

        $project->update(['progress_percentage' => min($percentage, 100)]);
    }
}
