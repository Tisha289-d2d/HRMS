<?php

namespace App\Jobs;

use App\Models\BirthdayNotificationLog;
use App\Services\BirthdayNotificationService;
use Carbon\Carbon;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class UpcomingBirthdayReminderJob implements ShouldQueue
{
    use Queueable;

    public function handle(BirthdayNotificationService $notificationService): void
    {
        $tomorrow = Carbon::tomorrow();
        $alreadyProcessed = BirthdayNotificationLog::where('notification_type', 'upcoming_reminder_check')
            ->where('notification_date', $tomorrow)
            ->exists();

        if ($alreadyProcessed) return;

        $notificationService->sendUpcomingReminders();

        BirthdayNotificationLog::create([
            'employee_id' => 1,
            'notification_type' => 'upcoming_reminder_check',
            'notification_date' => $tomorrow,
            'status' => 'completed',
        ]);
    }
}
