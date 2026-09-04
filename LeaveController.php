<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Leave;
use App\Models\Employee;
use App\Models\Holiday;
use Illuminate\Http\Request;
use Carbon\Carbon;

class LeaveController extends Controller
{
    public function myLeaves(Request $request)
    {
        $user = $request->user();
        $employee = Employee::where('user_id', $user->id)->first();
        if (!$employee) {
            return response()->json([]);
        }
        $leaves = Leave::where('employee_id', $employee->id)->latest()->get();
        return response()->json($leaves);
    }

    public function index(Request $request)
    {
        $query = Leave::with('employee.user');

        if ($request->has('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'leave_type' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string',
        ]);

        $employee = Employee::find($request->employee_id);
        if (!$employee) {
            return response()->json([
                'message' => 'Employee profile not found'
            ], 400);
        }

        $from = Carbon::parse($request->start_date);
        $to = Carbon::parse($request->end_date);
        $days = $from->diffInDays($to) + 1;

        $typeLower = strtolower($request->leave_type);
        $limit = null;
        $typeName = '';

        if (str_contains($typeLower, 'paid') && !str_contains($typeLower, 'unpaid')) {
            $limit = 2;
            $typeName = 'Paid Leave';
        } elseif (str_contains($typeLower, 'sick')) {
            $limit = 5;
            $typeName = 'Sick Leave';
        }

        if ($limit !== null) {
            $month = $from->month;
            $year = $from->year;

            $usedLeaves = Leave::where('employee_id', $employee->id)
                ->where('status', '!=', 'rejected')
                ->where('leave_type', 'like', '%' . (str_contains($typeLower, 'sick') ? 'sick' : 'paid') . '%')
                ->where(function($q) use ($typeLower) {
                    if (str_contains($typeLower, 'paid')) {
                        $q->where('leave_type', 'not like', '%unpaid%');
                    }
                })
                ->whereMonth('from_date', $month)
                ->whereYear('from_date', $year)
                ->sum('days');

            if (($usedLeaves + $days) > $limit) {
                return response()->json([
                    'message' => "Monthly {$typeName} limit of {$limit} days exceeded (Used: {$usedLeaves}, Requesting: {$days})"
                ], 400);
            }
        }

        $leave = Leave::create([
            'employee_id' => $employee->id,
            'leave_type' => $request->leave_type,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'from_date' => $request->start_date,
            'to_date' => $request->end_date,
            'days' => $days,
            'reason' => $request->reason,
            'status' => 'pending'
        ]);

        return response()->json($leave, 201);
    }

    public function approve($id)
    {
        $leave = Leave::findOrFail($id);

        $leave->update(['status' => 'approved']);

        return response()->json([
            'message' => 'Leave Approved Successfully'
        ]);
    }

    public function reject($id)
    {
        $leave = Leave::findOrFail($id);
        $leave->update(['status' => 'rejected']);
        return response()->json([
            'message' => 'Leave request rejected successfully',
            'leave' => $leave
        ]);
    }

    public function forward($id)
    {
        $leave = Leave::findOrFail($id);
        $leave->update(['status' => 'forwarded']);
        return response()->json([
            'message' => 'Leave request forwarded to Admin successfully',
            'leave' => $leave
        ]);
    }

    public function apply(Request $request)
    {
        $request->validate([
            'leave_type' => 'required|string',
            'from_date' => 'required|date',
            'to_date' => 'required|date|after_or_equal:from_date',
            'reason' => 'nullable|string'
        ]);

        $employee = $request->user()->employee ?? Employee::where('user_id', $request->user()->id)->first();
        if (!$employee) {
            return response()->json([
                'message' => 'Employee profile not found'
            ], 400);
        }

        $from = Carbon::parse($request->from_date);
        $to = Carbon::parse($request->to_date);

        for ($date = $from->copy(); $date->lte($to); $date->addDay()) {
            if (Holiday::matchesEmployeeOnDate($employee, $date)) {
                return response()->json([
                    'message' => 'Leave cannot overlap with a company holiday on ' . $date->toDateString(),
                ], 422);
            }
        }

        $days = $from->diffInDays($to) + 1;

        $typeLower = strtolower($request->leave_type);
        $limit = null;
        $typeName = '';

        if (str_contains($typeLower, 'paid') && !str_contains($typeLower, 'unpaid')) {
            $limit = 2;
            $typeName = 'Paid Leave';
        } elseif (str_contains($typeLower, 'sick')) {
            $limit = 5;
            $typeName = 'Sick Leave';
        }

        if ($limit !== null) {
            $month = $from->month;
            $year = $from->year;

            $usedLeaves = Leave::where('employee_id', $employee->id)
                ->where('status', '!=', 'rejected')
                ->where('leave_type', 'like', '%' . (str_contains($typeLower, 'sick') ? 'sick' : 'paid') . '%')
                ->where(function($q) use ($typeLower) {
                    if (str_contains($typeLower, 'paid')) {
                        $q->where('leave_type', 'not like', '%unpaid%');
                    }
                })
                ->whereMonth('from_date', $month)
                ->whereYear('from_date', $year)
                ->sum('days');

            if (($usedLeaves + $days) > $limit) {
                return response()->json([
                    'message' => "Monthly {$typeName} limit of {$limit} days exceeded (Used: {$usedLeaves}, Requesting: {$days})"
                ], 400);
            }
        }

        $leave = Leave::create([
            'employee_id' => $employee->id,
            'leave_type' => $request->leave_type,
            'start_date' => $request->from_date,
            'end_date' => $request->to_date,
            'from_date' => $request->from_date,
            'to_date' => $request->to_date,
            'days' => $days,
            'reason' => $request->reason,
            'status' => 'pending'
        ]);

        return response()->json([
            'message' => 'Leave applied successfully',
            'leave' => $leave
        ]);
    }

    public function counts(Request $request)
    {
        if ($request->has('employee_id')) {
            $employee = Employee::find($request->employee_id);
        } else {
            $employee = $request->user()->employee ?? Employee::where('user_id', $request->user()->id)->first();
        }

        if (!$employee) {
            return response()->json([
                'paid_leave' => 0,
                'sick_leave' => 0,
                'unpaid_leave' => 0
            ]);
        }

        $monthsMap = [
            'january' => 1, 'february' => 2, 'march' => 3, 'april' => 4,
            'may' => 5, 'june' => 6, 'july' => 7, 'august' => 8,
            'september' => 9, 'october' => 10, 'november' => 11, 'december' => 12
        ];
        
        $month = now()->month;
        if ($request->has('month')) {
            $m = strtolower($request->month);
            if (isset($monthsMap[$m])) {
                $month = $monthsMap[$m];
            } elseif (is_numeric($request->month)) {
                $month = (int)$request->month;
            }
        }
        
        $year = $request->has('year') ? (int)$request->year : now()->year;

        $statusParam = $request->input('status');

        $paidQuery = Leave::where('employee_id', $employee->id)
            ->where('leave_type', 'like', '%paid%')
            ->where('leave_type', 'not like', '%unpaid%')
            ->whereMonth('from_date', $month)
            ->whereYear('from_date', $year);

        $sickQuery = Leave::where('employee_id', $employee->id)
            ->where('leave_type', 'like', '%sick%')
            ->whereMonth('from_date', $month)
            ->whereYear('from_date', $year);

        $unpaidQuery = Leave::where('employee_id', $employee->id)
            ->where('leave_type', 'like', '%unpaid%')
            ->whereMonth('from_date', $month)
            ->whereYear('from_date', $year);

        if ($statusParam) {
            $paidQuery->where('status', $statusParam);
            $sickQuery->where('status', $statusParam);
            $unpaidQuery->where('status', $statusParam);
        } else {
            $paidQuery->where('status', '!=', 'rejected');
            $sickQuery->where('status', '!=', 'rejected');
            $unpaidQuery->where('status', '!=', 'rejected');
        }

        $paid = $paidQuery->sum('days');
        $sick = $sickQuery->sum('days');
        $unpaid = $unpaidQuery->sum('days');

        return response()->json([
            'paid_leave' => $paid,
            'sick_leave' => $sick,
            'unpaid_leave' => $unpaid
        ]);
    }
}
