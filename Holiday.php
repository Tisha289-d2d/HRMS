<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Holiday extends Model
{
    protected $fillable = [
        'title',
        'holiday_date',
        'type',
        'description',
        'department_id',
        'role_target',
        'is_optional',
        'is_recurring',
        'is_approved',
    ];

    protected $casts = [
        'is_optional'  => 'boolean',
        'is_recurring' => 'boolean',
        'is_approved'  => 'boolean',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Count mandatory (non-optional) holidays for an employee in a given month/year.
     */
    public static function countInMonthForEmployee($employeeId, $month, $year)
    {
        $employee      = Employee::find($employeeId);
        $user          = $employee ? $employee->user : null;
        $departmentIds = $employee ? $employee->departments()->pluck('departments.id')->toArray() : [];
        $role          = $user ? $user->role : 'employee';

        return self::whereMonth('holiday_date', $month)
                   ->whereYear('holiday_date', $year)
                   ->where('is_optional', false)
                   ->where('is_approved', true)
                   ->where(function ($q) use ($role) {
                       $q->whereNull('role_target')
                         ->orWhere('role_target', '')
                         ->orWhere('role_target', 'all')
                         ->orWhere('role_target', $role);
                   })
                   ->where(function ($q) use ($departmentIds) {
                       $q->whereNull('department_id')
                         ->orWhereIn('department_id', $departmentIds);
                   })
                   ->count();
    }

    /**
     * Get an array of holiday date strings (Y-m-d) for an employee in a given month/year.
     * Used by payroll to know which days are official paid holidays.
     */
    public static function getHolidayDatesInMonth($employeeId, $month, $year)
    {
        $employee      = Employee::find($employeeId);
        $user          = $employee ? $employee->user : null;
        $departmentIds = $employee ? $employee->departments()->pluck('departments.id')->toArray() : [];
        $role          = $user ? $user->role : 'employee';

        return self::whereMonth('holiday_date', $month)
                   ->whereYear('holiday_date', $year)
                   ->where('is_optional', false)
                   ->where('is_approved', true)
                   ->where(function ($q) use ($role) {
                       $q->whereNull('role_target')
                         ->orWhere('role_target', '')
                         ->orWhere('role_target', 'all')
                         ->orWhere('role_target', $role);
                   })
                   ->where(function ($q) use ($departmentIds) {
                       $q->whereNull('department_id')
                         ->orWhereIn('department_id', $departmentIds);
                   })
                   ->pluck('holiday_date')
                   ->map(fn($d) => \Carbon\Carbon::parse($d)->toDateString())
                   ->toArray();
    }

    /**
     * Check whether a given date is a mandatory (non-optional) holiday for a given employee.
     */
    public static function matchesEmployeeOnDate($employee, $date)
    {
        $user          = $employee ? $employee->user : null;
        $departmentIds = $employee ? $employee->departments()->pluck('departments.id')->toArray() : [];
        $role          = $user ? $user->role : 'employee';

        return self::whereDate('holiday_date', $date)
                   ->where('is_optional', false)
                   ->where('is_approved', true)
                   ->where(function ($q) use ($role) {
                       $q->whereNull('role_target')
                         ->orWhere('role_target', '')
                         ->orWhere('role_target', 'all')
                         ->orWhere('role_target', $role);
                   })
                   ->where(function ($q) use ($departmentIds) {
                       $q->whereNull('department_id')
                         ->orWhereIn('department_id', $departmentIds);
                   })
                   ->exists();
    }
}
