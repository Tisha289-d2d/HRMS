<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Department;
use App\Models\Attendance;
use App\Models\Leave;
use App\Models\Payroll;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if ($user && $user->role === 'employee') {
            $employee = Employee::where('user_id', $user->id)->first();
            if (!$employee) {
                return response()->json([
                    'attendance_summary' => 0,
                    'leave_summary' => ['total' => 0, 'approved' => 0],
                    'recent_payroll' => null
                ]);
            }
            $daysPresent = Attendance::where('employee_id', $employee->id)
                ->where('status', 'Present')
                ->count();
            $totalLeaves = Leave::where('employee_id', $employee->id)->count();
            $approvedLeaves = Leave::where('employee_id', $employee->id)
                ->where('status', 'approved')
                ->count();
            $recentPayroll = Payroll::where('employee_id', $employee->id)
                ->latest()
                ->first();
            return response()->json([
                'attendance_summary' => $daysPresent,
                'leave_summary' => [
                    'total' => $totalLeaves,
                    'approved' => $approvedLeaves,
                ],
                'recent_payroll' => $recentPayroll
            ]);
        }

        return response()->json([
            'total_employees' => Employee::count(),
            'total_departments' => Department::count(),
            'pending_leaves' => Leave::whereIn('status', ['pending', 'forwarded'])->count(),
            'leave_status_counts' => [
                'pending' => Leave::where('status', 'pending')->count(),
                'forwarded' => Leave::where('status', 'forwarded')->count(),
                'approved' => Leave::where('status', 'approved')->count(),
                'rejected' => Leave::where('status', 'rejected')->count(),
            ],
            'employees_by_department' => Department::withCount('employees')->get(),
            'recent_attendance' => Attendance::with(['employee.user'])
                ->latest()
                ->take(10)
                ->get(),
        ]);
    }
}
