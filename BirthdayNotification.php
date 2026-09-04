<?php

namespace App\Notifications;

use App\Models\Employee;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class BirthdayNotification extends Notification
{
    use Queueable;

    public Employee $employee;
    public string $type;

    public function __construct(Employee $employee, string $type = 'birthday')
    {
        $this->employee = $employee;
        $this->type = $type;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $name = $this->employee->user?->name ?? 'A colleague';

        if ($this->type === 'upcoming') {
            $message = "{$name} has a birthday tomorrow! 🎉";
        } elseif ($this->type === 'admin_hr_reminder') {
            $message = "🎂 Today is {$name}'s birthday! Send your wishes.";
        } else {
            $message = "🎂 Today is {$name}'s birthday!";
        }

        return [
            'title' => 'Birthday ' . ($this->type === 'upcoming' ? 'Reminder' : 'Notification'),
            'message' => $message,
            'employee_id' => $this->employee->id,
            'type' => 'birthday',
        ];
    }
}
