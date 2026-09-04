<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PayrollSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'salary_cycle', 'payroll_generation_day',
        'tax_percentage', 'pf_percentage', 'esi_percentage',
        'created_by', 'updated_by',
    ];

    protected $casts = [
        'tax_percentage' => 'decimal:2',
        'pf_percentage' => 'decimal:2',
        'esi_percentage' => 'decimal:2',
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
