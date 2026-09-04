<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\BirthdayNotificationLog;
use App\Models\User;
use App\Mail\BirthdayGreetingMail;
use App\Notifications\BirthdayNotification;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class BirthdayNotificationService
{
    public function sendBirthdayNotifications(Employee $employee)
    {
        $today = Carbon::today();
        $alreadySent = BirthdayNotificationLog::where('employee_id', $employee->id)
            ->where('notification_type', 'birthday')
            ->where('notification_date', $today)
            ->exists();

        if ($alreadySent) return;

        $adminsAndHr = User::whereIn('role', ['admin', 'hr'])->get();
        $employees = User::where('role', 'employee')->get();

        foreach ($adminsAndHr as $user) {
            $user->notify(new BirthdayNotification($employee, 'admin_hr_reminder'));
        }

        foreach ($employees as $user) {
            $user->notify(new BirthdayNotification($employee, 'employee_reminder'));
        }

        $this->sendBirthdayEmail($employee);

        BirthdayNotificationLog::create([
            'employee_id' => $employee->id,
            'notification_type' => 'birthday',
            'notification_date' => $today,
            'status' => 'sent',
        ]);
    }

    public function sendUpcomingReminders()
    {
        $tomorrow = Carbon::tomorrow();
        $employees = Employee::whereRaw('MONTH(dob) = ? AND DAY(dob) = ?', [$tomorrow->month, $tomorrow->day])
            ->with('user')
            ->get();

        foreach ($employees as $employee) {
            $alreadySent = BirthdayNotificationLog::where('employee_id', $employee->id)
                ->where('notification_type', 'upcoming_reminder')
                ->where('notification_date', $tomorrow)
                ->exists();

            if ($alreadySent) continue;

            $users = User::whereIn('role', ['admin', 'hr'])->get();

            foreach ($users as $user) {
                $user->notify(new BirthdayNotification($employee, 'upcoming'));
            }

            BirthdayNotificationLog::create([
                'employee_id' => $employee->id,
                'notification_type' => 'upcoming_reminder',
                'notification_date' => $tomorrow,
                'status' => 'sent',
            ]);
        }
    }

    public function sendBirthdayEmail(Employee $employee)
    {
        try {
            $user = $employee->user;
            if (!$user || !$user->email) return;

            Mail::to($user->email)->send(new BirthdayGreetingMail($employee));
        } catch (\Exception $e) {
            Log::error("Failed to send birthday email to {$employee->id}: {$e->getMessage()}");
        }
    }
}
