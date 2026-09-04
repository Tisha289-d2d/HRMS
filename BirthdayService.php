<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\Announcement;
use App\Models\ActivityLog;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class BirthdayService
{
    public function getTodaysBirthdays()
    {
        $today = Carbon::today();
        return Employee::whereRaw('MONTH(dob) = ? AND DAY(dob) = ?', [$today->month, $today->day])
            ->with(['user', 'departments'])
            ->get();
    }

    public function getUpcomingBirthdays($days = 7)
    {
        $today = Carbon::today();
        $end = Carbon::today()->addDays($days);

        $employees = Employee::with(['user', 'departments'])->get();

        return $employees->filter(function ($employee) use ($today, $end) {
            if (!$employee->dob) return false;
            $dob = Carbon::parse($employee->dob);
            $nextBirthday = Carbon::create(null, $dob->month, $dob->day);
            if ($nextBirthday->lt($today)) {
                $nextBirthday->addYear();
            }
            return $nextBirthday->between($today, $end);
        })->values()->map(function ($employee) use ($today) {
            $dob = Carbon::parse($employee->dob);
            $nextBirthday = Carbon::create(null, $dob->month, $dob->day);
            if ($nextBirthday->lt($today)) {
                $nextBirthday->addYear();
            }
            $employee->days_until = $today->diffInDays($nextBirthday);
            $employee->age = $today->diffInYears($dob);
            return $employee;
        })->sortBy('days_until')->values();
    }

    public function getMonthlyBirthdays($month = null)
    {
        $month = $month ?: Carbon::today()->month;
        return Employee::whereRaw('MONTH(dob) = ?', [$month])
            ->with(['user', 'departments'])
            ->orderByRaw('DAY(dob) ASC')
            ->get()
            ->map(function ($employee) {
                $dob = Carbon::parse($employee->dob);
                $employee->age = Carbon::today()->diffInYears($dob);
                return $employee;
            });
    }

    public function getAllBirthdays($filters = [])
    {
        $query = Employee::with(['user', 'departments'])->whereNotNull('dob');

        if (!empty($filters['department_id'])) {
            $query->whereHas('departments', function ($q) use ($filters) {
                $q->where('departments.id', $filters['department_id']);
            });
        }

        if (!empty($filters['month'])) {
            $query->whereRaw('MONTH(dob) = ?', [$filters['month']]);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        return $query->orderByRaw('MONTH(dob) ASC, DAY(dob) ASC')
            ->paginate($filters['per_page'] ?? 10);
    }

    public function createBirthdayAnnouncement(Employee $employee)
    {
        $user = $employee->user;
        if (!$user) return;

        $announcement = Announcement::create([
            'title' => "Happy Birthday {$user->name} 🎉",
            'content' => "Please join us in wishing {$user->name} a very happy birthday! 🎂🎈",
            'published_at' => Carbon::now(),
            'is_active' => true,
            'created_by' => 1,
        ]);

        ActivityLog::create([
            'user_id' => 1,
            'activity' => "Birthday announcement created for {$user->name}",
            'ip_address' => request()->ip() ?? '127.0.0.1',
        ]);

        return $announcement;
    }

    public function getMonthlyReport($year = null)
    {
        $year = $year ?: Carbon::today()->year;
        $months = range(1, 12);
        $report = [];

        foreach ($months as $month) {
            $count = Employee::whereRaw('MONTH(dob) = ?', [$month])->count();
            $report[] = [
                'month' => Carbon::create()->month($month)->format('F'),
                'month_number' => $month,
                'count' => $count,
            ];
        }

        return $report;
    }

    public function getDepartmentReport()
    {
        return \App\Models\Department::withCount(['employees' => function ($q) {
            $q->whereNotNull('dob');
        }])->get()->map(function ($dept) {
            return [
                'department' => $dept->name,
                'count' => $dept->employees_count,
            ];
        });
    }

    public function getUpcomingReport($days = 30)
    {
        return $this->getUpcomingBirthdays($days);
    }
}
