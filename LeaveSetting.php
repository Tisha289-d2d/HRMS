<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LeaveSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'annual_leave', 'sick_leave', 'casual_leave',
        'maternity_leave', 'paternity_leave', 'carry_forward_enabled',
        'created_by', 'updated_by',
    ];

    protected $casts = [
        'carry_forward_enabled' => 'boolean',
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
