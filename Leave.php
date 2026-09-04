<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Leave extends Model
{
    protected $fillable = [
        'employee_id', 'leave_type', 'start_date', 'end_date', 'from_date', 'to_date', 'days', 'reason', 'status'
    ];

    protected $appends = ['paid_leaves_this_month', 'sick_leaves_this_month', 'unpaid_leaves_this_month'];

    public function setStatusAttribute($value): void
    {
        $this->attributes['status'] = strtolower((string) $value);
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function getPaidLeavesThisMonthAttribute()
    {
        $month = now()->month;
        $year = now()->year;
        return self::where('employee_id', $this->employee_id)
            ->where('leave_type', 'like', '%paid%')
            ->where('leave_type', 'not like', '%unpaid%')
            ->where('status', 'approved')
            ->whereMonth('from_date', $month)
            ->whereYear('from_date', $year)
            ->sum('days');
    }

    public function getSickLeavesThisMonthAttribute()
    {
        $month = now()->month;
        $year = now()->year;
        return self::where('employee_id', $this->employee_id)
            ->where('leave_type', 'like', '%sick%')
            ->where('status', 'approved')
            ->whereMonth('from_date', $month)
            ->whereYear('from_date', $year)
            ->sum('days');
    }

    public function getUnpaidLeavesThisMonthAttribute()
    {
        $month = now()->month;
        $year = now()->year;
        return self::where('employee_id', $this->employee_id)
            ->where('leave_type', 'like', '%unpaid%')
            ->where('status', 'approved')
            ->whereMonth('from_date', $month)
            ->whereYear('from_date', $year)
            ->sum('days');
    }
}
