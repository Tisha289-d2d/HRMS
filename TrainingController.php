<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Training;
use App\Models\TrainingAssignment;
use App\Models\TrainingAttendance;
use App\Models\Course;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TrainingController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = Training::with(['course', 'trainer.user', 'creator']);

        if ($user->role === 'employee') {
            $employee = $user->employee;
            if ($employee) {
                $trainingIds = TrainingAssignment::where('employee_id', $employee->id)->pluck('training_id');
                $query->whereIn('id', $trainingIds);
            } else {
                return response()->json(['data' => [], 'meta' => ['total' => 0]]);
            }
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        if ($request->filled('course_id')) {
            $query->where('course_id', $request->course_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('mode')) {
            $query->where('mode', $request->mode);
        }

        $sortField = $request->sort_by ?? 'created_at';
        $sortOrder = $request->sort_order ?? 'desc';
        $allowedSorts = ['title', 'status', 'start_date', 'end_date', 'mode', 'created_at'];
        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortOrder === 'asc' ? 'asc' : 'desc');
        }

        $perPage = $request->per_page ?? 10;
        $trainings = $query->paginate($perPage);

        $trainings->getCollection()->transform(function ($training) {
            $training->assigned_count = $training->assignments()->count();
            $training->attended_count = $training->attendance()->where('status', 'Present')->count();
            return $training;
        });

        return response()->json([
            'data' => $trainings->items(),
            'meta' => [
                'current_page' => $trainings->currentPage(),
                'last_page' => $trainings->lastPage(),
                'total' => $trainings->total(),
                'per_page' => $trainings->perPage(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'course_id' => 'nullable|exists:courses,id',
            'trainer_id' => 'nullable|exists:employees,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'location' => 'nullable|string|max:255',
            'meeting_link' => 'nullable|url|max:500',
            'mode' => 'nullable|in:Online,Offline',
            'status' => 'nullable|in:Scheduled,In Progress,Completed,Cancelled',
        ]);

        $validated['created_by'] = Auth::id();

        $training = Training::create($validated);
        $training->load(['course', 'trainer.user', 'creator']);

        return response()->json(['message' => 'Training created successfully', 'data' => $training], 201);
    }

    public function show($id)
    {
        $training = Training::with([
            'course',
            'trainer.user',
            'creator',
            'assignments.employee.user',
            'attendance.employee.user',
            'assessments.results.employee.user',
        ])->findOrFail($id);

        $training->assigned_count = $training->assignments()->count();
        $training->attended_count = $training->attendance()->where('status', 'Present')->count();

        return response()->json(['data' => $training]);
    }

    public function update(Request $request, $id)
    {
        $training = Training::findOrFail($id);

        $validated = $request->validate([
            'course_id' => 'nullable|exists:courses,id',
            'trainer_id' => 'nullable|exists:employees,id',
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'location' => 'nullable|string|max:255',
            'meeting_link' => 'nullable|url|max:500',
            'mode' => 'sometimes|in:Online,Offline',
            'status' => 'sometimes|in:Scheduled,In Progress,Completed,Cancelled',
        ]);

        $training->update($validated);
        $training->load(['course', 'trainer.user', 'creator']);

        return response()->json(['message' => 'Training updated successfully', 'data' => $training]);
    }

    public function destroy($id)
    {
        $training = Training::findOrFail($id);
        $training->delete();
        return response()->json(['message' => 'Training deleted successfully']);
    }

    public function assignments($trainingId)
    {
        $assignments = TrainingAssignment::with(['employee.user'])
            ->where('training_id', $trainingId)
            ->get();

        return response()->json(['data' => $assignments]);
    }

    public function storeAssignment(Request $request)
    {
        $validated = $request->validate([
            'training_id' => 'required|exists:trainings,id',
            'employee_ids' => 'required|array',
            'employee_ids.*' => 'exists:employees,id',
        ]);

        $created = [];
        foreach ($validated['employee_ids'] as $employeeId) {
            $assignment = TrainingAssignment::firstOrCreate([
                'training_id' => $validated['training_id'],
                'employee_id' => $employeeId,
            ], [
                'status' => 'Pending',
                'progress' => 0,
            ]);
            $created[] = $assignment;
        }

        return response()->json(['message' => 'Employees assigned successfully', 'data' => $created], 201);
    }

    public function updateAssignment(Request $request, $id)
    {
        $assignment = TrainingAssignment::findOrFail($id);

        $validated = $request->validate([
            'status' => 'sometimes|in:Pending,In Progress,Completed,Cancelled',
            'progress' => 'sometimes|integer|min:0|max:100',
        ]);

        if (($validated['progress'] ?? $assignment->progress) >= 100) {
            $validated['status'] = 'Completed';
        }

        $assignment->update($validated);
        $assignment->load(['employee.user']);

        return response()->json(['message' => 'Assignment updated successfully', 'data' => $assignment]);
    }

    public function destroyAssignment($id)
    {
        $assignment = TrainingAssignment::findOrFail($id);
        $assignment->delete();
        return response()->json(['message' => 'Assignment removed successfully']);
    }

    public function attendance($trainingId)
    {
        $attendance = TrainingAttendance::with(['employee.user'])
            ->where('training_id', $trainingId)
            ->get();

        return response()->json(['data' => $attendance]);
    }

    public function storeAttendance(Request $request)
    {
        $validated = $request->validate([
            'training_id' => 'required|exists:trainings,id',
            'records' => 'required|array',
            'records.*.employee_id' => 'required|exists:employees,id',
            'records.*.status' => 'required|in:Present,Absent,Late',
            'records.*.remarks' => 'nullable|string',
        ]);

        $saved = [];
        foreach ($validated['records'] as $record) {
            $att = TrainingAttendance::updateOrCreate(
                [
                    'training_id' => $validated['training_id'],
                    'employee_id' => $record['employee_id'],
                ],
                [
                    'status' => $record['status'],
                    'remarks' => $record['remarks'] ?? null,
                ]
            );
            $saved[] = $att;
        }

        return response()->json(['message' => 'Attendance saved successfully', 'data' => $saved], 201);
    }

    public function trainers()
    {
        $trainers = Employee::with('user')
            ->whereHas('user', function ($q) {
                $q->whereIn('role', ['admin', 'hr']);
            })
            ->get();

        return response()->json(['data' => $trainers]);
    }

    public function myTrainings()
    {
        $user = Auth::user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json(['data' => []]);
        }

        $trainings = Training::with(['course', 'trainer.user'])
            ->whereHas('assignments', function ($q) use ($employee) {
                $q->where('employee_id', $employee->id);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        $trainings->transform(function ($training) use ($employee) {
            $assignment = $training->assignments()->where('employee_id', $employee->id)->first();
            $training->assignment_status = $assignment?->status;
            $training->assignment_progress = $assignment?->progress;
            $attendance = $training->attendance()->where('employee_id', $employee->id)->first();
            $training->attendance_status = $attendance?->status;
            return $training;
        });

        return response()->json(['data' => $trainings]);
    }

    public function stats()
    {
        $total = Training::count();
        $scheduled = Training::where('status', 'Scheduled')->count();
        $inProgress = Training::where('status', 'In Progress')->count();
        $completed = Training::where('status', 'Completed')->count();
        $cancelled = Training::where('status', 'Cancelled')->count();

        $totalAssignments = TrainingAssignment::count();
        $completedAssignments = TrainingAssignment::where('status', 'Completed')->count();
        $totalAttendance = TrainingAttendance::count();
        $presentAttendance = TrainingAttendance::where('status', 'Present')->count();

        $completionRate = $totalAssignments > 0 ? round(($completedAssignments / $totalAssignments) * 100, 2) : 0;

        $monthlyTrend = Training::select(
            DB::raw('YEAR(created_at) as year'),
            DB::raw('MONTH(created_at) as month'),
            DB::raw('COUNT(*) as total'),
        )
        ->groupBy(DB::raw('YEAR(created_at)'), DB::raw('MONTH(created_at)'))
        ->orderBy(DB::raw('YEAR(created_at)'), 'desc')
        ->orderBy(DB::raw('MONTH(created_at)'), 'desc')
        ->take(12)
        ->get();

        return response()->json([
            'total_trainings' => $total,
            'scheduled' => $scheduled,
            'in_progress' => $inProgress,
            'completed' => $completed,
            'cancelled' => $cancelled,
            'total_assignments' => $totalAssignments,
            'completed_assignments' => $completedAssignments,
            'total_attendance' => $totalAttendance,
            'present_attendance' => $presentAttendance,
            'completion_rate' => $completionRate,
            'monthly_trend' => $monthlyTrend,
        ]);
    }
}
