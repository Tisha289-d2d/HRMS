<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payroll extends Model
{
    protected $fillable = [
        'employee_id',
        'basic_salary',
        'bonus',
        'deduction',
        'net_salary',
        'status',
        'stripe_payment_id',
        'month',
        'year',
        'bank_name',
        'account_number',
        'ifsc_code',
        'branch_name',
        'paid_leaves_count',
        'unpaid_leaves_count',
        'sick_leaves_count',
        'leave_deduction',
        'hr_signature',
        'admin_signature',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}