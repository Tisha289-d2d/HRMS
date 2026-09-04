<?php

namespace App\Jobs;

use App\Models\Employee;
use App\Models\BirthdayNotificationLog;
use App\Services\BirthdayService;
use App\Services\BirthdayNotificationService;
use Carbon\Carbon;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class DailyBirthdayCheckJob implements ShouldQueue
{
    use Queueable;

    public function handle(BirthdayService $birthdayService, BirthdayNotificationService $notificationService): void
    {
        $today = Carbon::today();
        $alreadyProcessed = BirthdayNotificationLog::where('notification_type', 'birthday_check')
            ->where('notification_date', $today)
            ->exists();

        if ($alreadyProcessed) return;

        $employees = Employee::whereRaw('MONTH(dob) = ? AND DAY(dob) = ?', [$today->month, $today->day])
            ->with('user')
            ->get();

        foreach ($employees as $employee) {
            $birthdayService->createBirthdayAnnouncement($employee);
            $notificationService->sendBirthdayNotifications($employee);
        }

        BirthdayNotificationLog::create([
            'employee_id' => 1,
            'notification_type' => 'birthday_check',
            'notification_date' => $today,
            'status' => 'completed',
        ]);
    }
}
