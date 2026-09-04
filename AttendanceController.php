<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Employee;
use App\Models\Holiday;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $query = Attendance::with('employee.user');
        if ($request->has('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }
        if ($request->has('date')) {
            $query->where('date', $request->date);
        }
        return response()->json($query->latest('date')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'status'      => 'required|string',
        ]);
        $attendance = Attendance::create([
            'employee_id' => $request->employee_id,
            'date'        => Carbon::today()->toDateString(),
            'check_in'    => Carbon::now()->toTimeString(),
            'status'      => $request->status,
        ]);
        return response()->json($attendance, 201);
    }

    public function update(Request $request, $id)
    {
        $attendance = Attendance::findOrFail($id);

        $updateData = [];
        if ($request->has('date'))      $updateData['date']      = $request->date;
        if ($request->has('check_in'))  $updateData['check_in']  = $request->check_in;
        if ($request->has('status'))    $updateData['status']    = $request->status;

        if ($request->has('check_out')) {
            $co = $request->check_out;
            // If truthy sentinel value, use current time; otherwise use given time string
            if ($co === true || $co === 'true' || $co === 1 || empty($co)) {
                $updateData['check_out'] = Carbon::now()->toTimeString();
            } else {
                $updateData['check_out'] = $co;
            }
        }

        $attendance->update($updateData);
        return response()->json($attendance);
    }

    /** Stats for today — used by Admin Attendance page */
    public function getStats(Request $request)
    {
        $today = Carbon::today()->toDateString();

        $totalEmployees = Employee::count();

        $totalPresent = Attendance::where('date', $today)
            ->whereIn('status', ['Present', 'Late', 'present', 'late'])
            ->count();

        $lateCheckin = Attendance::where('date', $today)
            ->where(function ($q) {
                $q->whereIn('status', ['Late', 'late'])
                  ->orWhereTime('check_in', '>', '09:15:00');
            })
            ->count();

        $totalAbsent = Attendance::where('date', $today)
            ->whereIn('status', ['Absent', 'absent'])
            ->count();

        $dailyLogs = Attendance::with('employee.user')
            ->where('date', $today)
            ->get();

        return response()->json([
            'total_employees'       => $totalEmployees,
            'total_present_today'   => $totalPresent,
            'late_check_in_today'   => $lateCheckin,
            'total_absent_today'    => $totalAbsent,
            'daily_attendance_logs' => $dailyLogs,
        ]);
    }

    /** Return today's attendance for the authenticated employee */
    public function getToday(Request $request)
    {
        $user     = $request->user();
        $employee = Employee::where('user_id', $user->id)->first();
        if (!$employee) return response()->json(null);

        $attendance = Attendance::where('employee_id', $employee->id)
            ->where('date', Carbon::today()->toDateString())
            ->first();
        return response()->json($attendance);
    }

    /** Employee clocks in — marks Present / Late / Holiday */
    public function clockIn(Request $request)
    {
        $user     = $request->user();
        $employee = Employee::where('user_id', $user->id)->first();
        if (!$employee) {
            return response()->json(['message' => 'Employee record not found'], 404);
        }

        $existing = Attendance::where('employee_id', $employee->id)
            ->where('date', Carbon::today()->toDateString())
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Already clocked in today', 'attendance' => $existing]);
        }

        $isHoliday = Holiday::matchesEmployeeOnDate($employee, Carbon::today());
        $now       = Carbon::now();

        if ($isHoliday) {
            $status   = 'Holiday';
            $checkIn  = null;
        } else {
            $checkIn = $now->toTimeString();
            $status  = ($now->format('H:i:s') > '09:15:00') ? 'Late' : 'Present';
        }

        $attendance = Attendance::create([
            'employee_id' => $employee->id,
            'date'        => Carbon::today()->toDateString(),
            'check_in'    => $checkIn,
            'status'      => $status,
        ]);

        return response()->json($attendance, 201);
    }

    /** Employee clocks out */
    public function clockOut(Request $request)
    {
        $user     = $request->user();
        $employee = Employee::where('user_id', $user->id)->first();
        if (!$employee) {
            return response()->json(['message' => 'Employee record not found'], 404);
        }

        $attendance = Attendance::where('employee_id', $employee->id)
            ->where('date', Carbon::today()->toDateString())
            ->first();

        if (!$attendance) {
            return response()->json(['message' => 'No attendance record for today. Please clock in first.'], 400);
        }
        if ($attendance->check_out) {
            return response()->json(['message' => 'Already clocked out today', 'attendance' => $attendance]);
        }

        $attendance->update(['check_out' => Carbon::now()->toTimeString()]);
        return response()->json($attendance);
    }

    /**
     * Auto-mark attendance for all employees who have no record today.
     * Weekends & holidays → mark as 'Holiday' (no fake check-in times).
     * Working days with no manual check-in → mark as 'Absent'.
     */
    public function autoMark(Request $request)
    {
        $today     = Carbon::today()->toDateString();
        $isWeekend = Carbon::today()->isWeekend();
        $employees = Employee::all();
        $count     = 0;

        foreach ($employees as $employee) {
            $alreadyExists = Attendance::where('employee_id', $employee->id)
                ->where('date', $today)
                ->exists();

            if ($alreadyExists) continue;

            $isHoliday = Holiday::matchesEmployeeOnDate($employee, Carbon::today());

            if ($isHoliday) {
                $status   = 'Holiday';
                $checkIn  = null;
                $checkOut = null;
            } elseif ($isWeekend) {
                $status   = 'Weekend';
                $checkIn  = null;
                $checkOut = null;
            } else {
                // No manual check-in on a working day → Absent
                $status   = 'Absent';
                $checkIn  = null;
                $checkOut = null;
            }

            Attendance::create([
                'employee_id' => $employee->id,
                'date'        => $today,
                'check_in'    => $checkIn,
                'check_out'   => $checkOut,
                'status'      => $status,
            ]);

            $count++;
        }

        return response()->json([
            'message' => "Auto-marked attendance for {$count} employees.",
            'marked'  => $count,
        ]);
    }

    /**
     * Auto-checkout: set check_out = check_in + 9 hours for anyone still clocked in.
     * Only processes employees who checked in but have no check_out yet.
     */
    public function autoCheckout(Request $request)
    {
        $today       = Carbon::today()->toDateString();
        $attendances = Attendance::where('date', $today)
            ->whereNotNull('check_in')
            ->whereNull('check_out')
            ->get();

        $count = 0;
        foreach ($attendances as $attendance) {
            $checkIn     = Carbon::parse($attendance->check_in);
            $checkOutDT  = $checkIn->copy()->addHours(9);
            // Cap at 23:59:59
            $maxTime = Carbon::today()->endOfDay();
            if ($checkOutDT->gt($maxTime)) $checkOutDT = $maxTime;

            $attendance->update(['check_out' => $checkOutDT->toTimeString()]);
            $count++;
        }

        return response()->json([
            'message'      => "Auto-checked out {$count} employees (9-hour rule).",
            'checked_out'  => $count,
        ]);
    }
}
