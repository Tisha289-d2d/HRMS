<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Attendance;
use App\Models\Leave;
use App\Models\Payroll;
use App\Models\Department;
use App\Models\Holiday;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function dashboardReport()
    {
        $user = Auth::user();
        if (!in_array($user->role, ['admin', 'hr'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $today = Carbon::today()->toDateString();

        $report = [
            'employees' => [
                'total_employees'  => Employee::count(),
                'active_employees' => Employee::count(),
            ],
            'departments' => [
                'total_departments'          => Department::count(),
                'department_wise_employees'  => Department::withCount('employees')->get(),
            ],
            'attendance' => [
                'total_attendance'   => Attendance::count(),
                'present_count'      => Attendance::whereIn('status', ['Present', 'present', 'Late', 'late'])->count(),
                'absent_count'       => Attendance::whereIn('status', ['Absent', 'absent'])->count(),
                'leave_count'        => Attendance::whereIn('status', ['Leave', 'leave', 'Holiday', 'holiday'])->count(),
                'today_present'      => Attendance::where('date', $today)->whereIn('status', ['Present', 'present', 'Late', 'late'])->count(),
                'today_absent'       => Attendance::where('date', $today)->whereIn('status', ['Absent', 'absent'])->count(),
                'today_late'         => Attendance::where('date', $today)->whereIn('status', ['Late', 'late'])->count(),
                'recent_attendance'  => Attendance::with('employee.user')->latest()->take(10)->get(),
            ],
            'leaves' => [
                'total_leaves'     => Leave::count(),
                'pending_leaves'   => Leave::where('status', 'pending')->count(),
                'forwarded_leaves' => Leave::where('status', 'forwarded')->count(),
                'approved_leaves'  => Leave::where('status', 'approved')->count(),
                'rejected_leaves'  => Leave::where('status', 'rejected')->count(),
                'recent_leaves'    => Leave::with('employee.user')->latest()->take(10)->get(),
            ],
            'payroll' => [
                'total_payroll'   => Payroll::sum('net_salary'),
                'average_salary'  => Payroll::avg('net_salary'),
                'highest_salary'  => Payroll::max('net_salary'),
                'lowest_salary'   => Payroll::min('net_salary'),
                'recent_payrolls' => Payroll::with('employee.user')->latest()->take(10)->get(),
            ],
        ];

        return response()->json($report);
    }

    /** Attendance Report — flat fields including check_in, check_out, work_hours */
    public function attendanceReport(Request $request)
    {
        $query = Attendance::with('employee.user');

        if ($request->has('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('date')) {
            $query->whereDate('date', $request->date);
        }
        if ($request->has('month')) {
            $query->whereMonth('date', $request->month);
        }
        if ($request->has('year')) {
            $query->whereYear('date', $request->year);
        }

        $records = $query->latest('date')->get()->map(function ($a) {
            $workHours = null;
            if ($a->check_in && $a->check_out) {
                $checkIn   = Carbon::parse($a->check_in);
                $checkOut  = Carbon::parse($a->check_out);
                $minutes   = $checkIn->diffInMinutes($checkOut);
                $workHours = round($minutes / 60, 2);
            }
            return [
                'id'            => $a->id,
                'employee_id'   => $a->employee_id,
                'employee_name' => $a->employee?->user?->name ?? 'Unknown',
                'date'          => $a->date,
                'check_in'      => $a->check_in,
                'check_out'     => $a->check_out,
                'work_hours'    => $workHours,
                'status'        => $a->status,
                'is_late'       => $a->check_in ? ($a->check_in > '09:15:00') : false,
            ];
        });

        return response()->json($records);
    }

    /** Leave Report — flat fields including leave type breakdown */
    public function leaveReport(Request $request)
    {
        $query = Leave::with('employee.user');

        if ($request->has('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('leave_type')) {
            $query->where('leave_type', 'like', '%' . $request->leave_type . '%');
        }
        if ($request->has('month')) {
            $query->whereMonth('from_date', $request->month);
        }
        if ($request->has('year')) {
            $query->whereYear('from_date', $request->year);
        }

        $records = $query->latest()->get()->map(function ($leave) {
            $typeLower   = strtolower($leave->leave_type ?? '');
            $isPaid      = str_contains($typeLower, 'paid') && !str_contains($typeLower, 'unpaid');
            $isSick      = str_contains($typeLower, 'sick') || str_contains($typeLower, 'medical');
            $isUnpaid    = str_contains($typeLower, 'unpaid');

            return [
                'id'            => $leave->id,
                'employee_id'   => $leave->employee_id,
                'employee_name' => $leave->employee?->user?->name ?? 'Unknown',
                'leave_type'    => $leave->leave_type,
                'type_category' => $isUnpaid ? 'Unpaid' : ($isSick ? 'Sick' : ($isPaid ? 'Paid' : 'Other')),
                'from_date'     => $leave->from_date ?? $leave->start_date,
                'to_date'       => $leave->to_date ?? $leave->end_date,
                'days'          => $leave->days,
                'reason'        => $leave->reason,
                'status'        => $leave->status,
                'is_paid'       => $isPaid,
                'is_sick'       => $isSick,
                'is_unpaid'     => $isUnpaid,
            ];
        });

        return response()->json($records);
    }

    /** Payroll Report — includes leave counts and deductions as flat fields */
    public function payrollReport(Request $request)
    {
        $query = Payroll::with('employee.user', 'employee.leaves');

        if ($request->has('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }
        if ($request->has('month')) {
            $query->where('month', $request->month);
        }
        if ($request->has('year')) {
            $query->where('year', $request->year);
        }

        $monthMap = [
            'january'   => 1, 'jan' => 1, 'february' => 2, 'feb' => 2, 'march' => 3, 'mar' => 3,
            'april'     => 4, 'apr' => 4, 'may' => 5, 'june' => 6, 'jun' => 6,
            'july'      => 7, 'jul' => 7, 'august' => 8, 'aug' => 8,
            'september' => 9, 'sep' => 9, 'sept' => 9, 'october' => 10, 'oct' => 10,
            'november'  => 11, 'nov' => 11, 'december' => 12, 'dec' => 12,
        ];

        $payrolls = $query->latest()->get()->map(function ($payroll) use ($monthMap) {
            $employee = $payroll->employee;
            $paidLeaves   = 0;
            $sickLeaves   = 0;
            $unpaidLeaves = 0;
            $leaveDeduction = (float) ($payroll->leave_deduction ?? 0);

            if ($employee) {
                $monthNum = $monthMap[strtolower($payroll->month)] ?? now()->month;
                $year     = $payroll->year;

                $monthLeaves = $employee->leaves
                    ->whereIn('status', ['approved', 'Approved'])
                    ->filter(function ($leave) use ($monthNum, $year) {
                        if (!$leave->from_date) return false;
                        $ld = Carbon::parse($leave->from_date);
                        return $ld->month == $monthNum && $ld->year == $year;
                    });

                foreach ($monthLeaves as $leave) {
                    $typeLower = strtolower($leave->leave_type);
                    $days      = (int) ($leave->days ?? 1);
                    if (str_contains($typeLower, 'unpaid')) {
                        $unpaidLeaves += $days;
                    } elseif (str_contains($typeLower, 'sick') || str_contains($typeLower, 'medical')) {
                        $sickLeaves += $days;
                    } else {
                        $paidLeaves += $days;
                    }
                }

                $basic          = (float) $payroll->basic_salary;
                $leaveDeduction = round(($basic / 30) * $unpaidLeaves, 2);
            }

            return [
                'id'                  => $payroll->id,
                'employee_id'         => $payroll->employee_id,
                'employee_name'       => $employee?->user?->name ?? 'Unknown',
                'designation'         => $employee?->designation ?? '',
                'month'               => $payroll->month,
                'year'                => $payroll->year,
                'basic_salary'        => $payroll->basic_salary,
                'bonus'               => $payroll->bonus ?? 0,
                'deduction'           => $payroll->deduction ?? 0,
                'paid_leaves_count'   => $paidLeaves,
                'sick_leaves_count'   => $sickLeaves,
                'unpaid_leaves_count' => $unpaidLeaves,
                'leave_deduction'     => $leaveDeduction,
                'net_salary'          => $payroll->net_salary,
                'status'              => $payroll->status,
                'bank_name'           => $payroll->bank_name ?? $employee?->bank_name,
                'account_number'      => $payroll->account_number ?? $employee?->account_number,
            ];
        });

        return response()->json($payrolls);
    }

    /** Employee Report — includes gender, dob, leave summary */
    public function employeeReport()
    {
        $employees = Employee::with(['user', 'departments', 'attendances', 'leaves'])->get()->map(function ($employee) {
            $approvedLeaves = $employee->leaves->whereIn('status', ['approved', 'Approved']);

            $paidLeaves   = $approvedLeaves->filter(fn($l) => str_contains(strtolower($l->leave_type), 'paid') && !str_contains(strtolower($l->leave_type), 'unpaid'))->sum('days');
            $sickLeaves   = $approvedLeaves->filter(fn($l) => str_contains(strtolower($l->leave_type), 'sick'))->sum('days');
            $unpaidLeaves = $approvedLeaves->filter(fn($l) => str_contains(strtolower($l->leave_type), 'unpaid'))->sum('days');

            return [
                'id'                  => $employee->id,
                'employee_name'       => $employee->user?->name ?? 'Unknown',
                'email'               => $employee->user?->email ?? '',
                'designation'         => $employee->designation,
                'gender'              => $employee->gender ?? 'N/A',
                'dob'                 => $employee->dob ?? 'N/A',
                'joining_date'        => $employee->joining_date,
                'salary'              => $employee->salary,
                'departments'         => $employee->departments->pluck('name')->join(', '),
                'total_present_days'  => $employee->attendances->whereIn('status', ['Present', 'present', 'Late', 'late'])->count(),
                'total_late_days'     => $employee->attendances->whereIn('status', ['Late', 'late'])->count(),
                'total_absent_days'   => $employee->attendances->whereIn('status', ['Absent', 'absent'])->count(),
                'paid_leaves_count'   => $paidLeaves,
                'sick_leaves_count'   => $sickLeaves,
                'unpaid_leaves_count' => $unpaidLeaves,
            ];
        });

        return response()->json($employees);
    }

    public function dashboard()
    {
        try {
            $today = Carbon::today()->toDateString();
            return response()->json([
                'employees' => Employee::count(),
                'present'   => Attendance::where('date', $today)->whereIn('status', ['Present', 'present', 'Late', 'late'])->count(),
                'absent'    => Attendance::where('date', $today)->whereIn('status', ['Absent', 'absent'])->count(),
                'leaves'    => Leave::where('status', 'approved')->count(),
                'payroll'   => Payroll::sum('net_salary'),
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'error'   => true,
                'message' => $e->getMessage(),
                'line'    => $e->getLine(),
                'file'    => $e->getFile(),
            ], 500);
        }
    }
}