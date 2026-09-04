<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\ProjectTask;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = Project::with(['manager.user', 'creator', 'members.employee.user', 'tasks']);

        if ($user->role === 'employee') {
            $employee = $user->employee;
            if ($employee) {
                $projectIds = ProjectMember::where('employee_id', $employee->id)->pluck('project_id');
                $query->whereIn('id', $projectIds);
            } else {
                return response()->json(['data' => [], 'meta' => ['total' => 0]]);
            }
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('project_name', 'like', "%{$search}%")
                  ->orWhere('project_code', 'like', "%{$search}%")
                  ->orWhere('client_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        $sortField = $request->sort_by ?? 'created_at';
        $sortOrder = $request->sort_order ?? 'desc';
        $allowedSorts = ['project_name', 'project_code', 'status', 'priority', 'start_date', 'end_date', 'created_at', 'progress_percentage'];
        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortOrder === 'asc' ? 'asc' : 'desc');
        }

        $perPage = $request->per_page ?? 10;
        $projects = $query->paginate($perPage);

        $projects->getCollection()->transform(function ($project) {
            $project->total_tasks = $project->tasks->count();
            $project->completed_tasks = $project->tasks->where('status', 'Completed')->count();
            $project->member_count = $project->members->count();
            unset($project->tasks);
            return $project;
        });

        return response()->json([
            'data' => $projects->items(),
            'meta' => [
                'current_page' => $projects->currentPage(),
                'last_page' => $projects->lastPage(),
                'total' => $projects->total(),
                'per_page' => $projects->perPage(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_code' => 'required|string|max:50|unique:projects,project_code',
            'project_name' => 'required|string|max:255',
            'client_name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'nullable|in:Pending,Active,On Hold,Completed,Cancelled',
            'priority' => 'nullable|in:Low,Medium,High,Critical',
            'budget' => 'nullable|numeric|min:0',
            'progress_percentage' => 'nullable|integer|min:0|max:100',
            'project_manager_id' => 'nullable|exists:employees,id',
        ]);

        $validated['created_by'] = Auth::id();

        $project = Project::create($validated);

        if ($request->filled('member_ids')) {
            $memberIds = $request->member_ids;
            foreach ($memberIds as $employeeId) {
                ProjectMember::create([
                    'project_id' => $project->id,
                    'employee_id' => $employeeId,
                    'assigned_date' => now()->toDateString(),
                ]);
            }
        }

        $project->load(['manager.user', 'creator', 'members.employee.user']);

        return response()->json(['message' => 'Project created successfully', 'data' => $project], 201);
    }

    public function show($id)
    {
        $user = Auth::user();
        $project = Project::with([
            'manager.user',
            'creator',
            'members.employee.user',
            'tasks.employee.user',
            'tasks.creator',
        ])->findOrFail($id);

        if ($user->role === 'employee') {
            $employee = $user->employee;
            $isMember = ProjectMember::where('project_id', $id)
                ->where('employee_id', $employee?->id)
                ->exists();
            if (!$isMember) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
        }

        return response()->json(['data' => $project]);
    }

    public function update(Request $request, $id)
    {
        $project = Project::findOrFail($id);

        $validated = $request->validate([
            'project_code' => 'sometimes|required|string|max:50|unique:projects,project_code,' . $id,
            'project_name' => 'sometimes|required|string|max:255',
            'client_name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'sometimes|in:Pending,Active,On Hold,Completed,Cancelled',
            'priority' => 'sometimes|in:Low,Medium,High,Critical',
            'budget' => 'nullable|numeric|min:0',
            'progress_percentage' => 'sometimes|integer|min:0|max:100',
            'project_manager_id' => 'nullable|exists:employees,id',
        ]);

        $project->update($validated);

        if ($request->has('member_ids')) {
            $existingMemberIds = $project->members->pluck('employee_id')->toArray();
            $newMemberIds = $request->member_ids ?? [];

            $toRemove = array_diff($existingMemberIds, $newMemberIds);
            ProjectMember::where('project_id', $id)
                ->whereIn('employee_id', $toRemove)
                ->delete();

            $toAdd = array_diff($newMemberIds, $existingMemberIds);
            foreach ($toAdd as $employeeId) {
                ProjectMember::create([
                    'project_id' => $project->id,
                    'employee_id' => $employeeId,
                    'assigned_date' => now()->toDateString(),
                ]);
            }
        }

        $project->load(['manager.user', 'creator', 'members.employee.user']);

        return response()->json(['message' => 'Project updated successfully', 'data' => $project]);
    }

    public function destroy($id)
    {
        $project = Project::findOrFail($id);
        $project->delete();
        return response()->json(['message' => 'Project deleted successfully']);
    }

    public function stats()
    {
        $total = Project::count();
        $active = Project::where('status', 'Active')->count();
        $completed = Project::where('status', 'Completed')->count();
        $onHold = Project::where('status', 'On Hold')->count();
        $cancelled = Project::where('status', 'Cancelled')->count();
        $pending = Project::where('status', 'Pending')->count();

        $overdue = Project::whereNotIn('status', ['Completed', 'Cancelled'])
            ->where('end_date', '<', now()->toDateString())
            ->count();

        $totalMembers = ProjectMember::count();
        $completionPercentage = $total > 0 ? round(($completed / $total) * 100, 2) : 0;

        $monthlySummary = Project::select(
            DB::raw('YEAR(created_at) as year'),
            DB::raw('MONTH(created_at) as month'),
            DB::raw('COUNT(*) as total'),
            DB::raw("SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed"),
            DB::raw("SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active"),
        )
        ->groupBy('year', 'month')
        ->orderBy('year', 'desc')
        ->orderBy('month', 'desc')
        ->take(12)
        ->get();

        return response()->json([
            'total_projects' => $total,
            'active_projects' => $active,
            'completed_projects' => $completed,
            'pending_projects' => $pending,
            'on_hold_projects' => $onHold,
            'cancelled_projects' => $cancelled,
            'overdue_projects' => $overdue,
            'total_members' => $totalMembers,
            'completion_percentage' => $completionPercentage,
            'monthly_summary' => $monthlySummary,
        ]);
    }
}
