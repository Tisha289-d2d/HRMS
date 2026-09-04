<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AttendanceSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'office_start_time', 'office_end_time', 'grace_period',
        'late_mark_after', 'half_day_after', 'overtime_enabled',
        'created_by', 'updated_by',
    ];

    protected $casts = [
        'overtime_enabled' => 'boolean',
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
