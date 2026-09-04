<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    public function index()
    {
        $tasks = Task::with(['assignee.user', 'creator', 'department'])->get();
        return response()->json(['data' => $tasks]);
    }

    public function employeeTasks()
    {
        $user = Auth::user();
        if (!$user || !$user->employee) {
            return response()->json(['message' => 'Employee profile not found'], 404);
        }
        $tasks = Task::with(['creator', 'department'])
            ->where('employee_id', $user->employee->id)
            ->get();
        return response()->json(['data' => $tasks]);
    }

    public function dashboardStats()
    {
        // For Admin/HR
        $pending = Task::where('status', 'Pending')->count();
        $inProgress = Task::where('status', 'In Progress')->count();
        $completed = Task::where('status', 'Completed')->count();
        
        // auto mark overdue based on due_date
        $overdueCount = Task::whereIn('status', ['Pending', 'In Progress'])
            ->where('due_date', '<', now()->toDateString())
            ->count();

        // Update overdue tasks status in DB
        Task::whereIn('status', ['Pending', 'In Progress'])
            ->where('due_date', '<', now()->toDateString())
            ->update(['status' => 'Overdue']);
            
        $overdue = Task::where('status', 'Overdue')->count();

        return response()->json([
            'pending' => $pending,
            'in_progress' => $inProgress,
            'completed' => $completed,
            'overdue' => $overdue
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'employee_id' => 'required|exists:employees,id',
            'department_id' => 'nullable|exists:departments,id',
            'priority' => 'required|in:Low,Medium,High,Urgent',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date',
            'status' => 'nullable|in:Pending,In Progress,Completed,Overdue',
            'progress' => 'nullable|integer|min:0|max:100',
        ]);

        $validated['created_by'] = Auth::id();
        
        // Handle file upload
        if ($request->hasFile('attachment')) {
            $path = $request->file('attachment')->store('tasks', 'public');
            $validated['attachment'] = $path;
        }

        $task = Task::create($validated);

        return response()->json(['message' => 'Task created successfully', 'data' => $task], 201);
    }

    public function show($id)
    {
        $task = Task::with(['assignee.user', 'creator', 'department', 'comments.user'])->findOrFail($id);
        return response()->json(['data' => $task]);
    }

    public function update(Request $request, $id)
    {
        $task = Task::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'employee_id' => 'sometimes|exists:employees,id',
            'department_id' => 'nullable|exists:departments,id',
            'priority' => 'sometimes|in:Low,Medium,High,Urgent',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date',
            'status' => 'sometimes|in:Pending,In Progress,Completed,Overdue',
            'progress' => 'sometimes|integer|min:0|max:100',
        ]);

        if ($request->hasFile('attachment')) {
            $path = $request->file('attachment')->store('tasks', 'public');
            $validated['attachment'] = $path;
        }

        $task->update($validated);

        return response()->json(['message' => 'Task updated successfully', 'data' => $task]);
    }

    public function updateProgress(Request $request, $id)
    {
        $task = Task::findOrFail($id);

        $validated = $request->validate([
            'progress' => 'required|integer|min:0|max:100',
            'status' => 'required|in:Pending,In Progress,Completed,Overdue',
            'remarks' => 'nullable|string'
        ]);

        if ($request->hasFile('attachment')) {
            $path = $request->file('attachment')->store('tasks', 'public');
            $validated['attachment'] = $path;
        }

        $task->update($validated);

        return response()->json(['message' => 'Task progress updated', 'data' => $task]);
    }

    public function destroy($id)
    {
        $task = Task::findOrFail($id);
        $task->delete();
        return response()->json(['message' => 'Task deleted successfully']);
    }
}
