<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BirthdayNotificationLog extends Model
{
    protected $fillable = ['employee_id', 'notification_type', 'notification_date', 'status'];
}
