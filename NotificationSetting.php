<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class NotificationSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'enable_email_notifications', 'enable_push_notifications',
        'enable_leave_notifications', 'enable_attendance_notifications',
        'enable_payroll_notifications', 'enable_announcement_notifications',
        'created_by', 'updated_by',
    ];

    protected $casts = [
        'enable_email_notifications' => 'boolean',
        'enable_push_notifications' => 'boolean',
        'enable_leave_notifications' => 'boolean',
        'enable_attendance_notifications' => 'boolean',
        'enable_payroll_notifications' => 'boolean',
        'enable_announcement_notifications' => 'boolean',
    ];

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
