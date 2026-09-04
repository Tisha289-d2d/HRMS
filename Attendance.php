<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = [
        'employee_id',
        'date',
        'check_in',
        'check_out',
        'status'
    ];

    protected $appends = ['work_hours'];

    public function getWorkHoursAttribute()
    {
        if ($this->check_in && $this->check_out) {
            $in = \Carbon\Carbon::parse($this->check_in);
            $out = \Carbon\Carbon::parse($this->check_out);
            return round($in->diffInMinutes($out) / 60, 2);
        }
        return 0;
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
