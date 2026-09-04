<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AssessmentResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'assessment_id',
        'employee_id',
        'marks_obtained',
        'remarks',
    ];

    public function assessment()
    {
        return $this->belongsTo(Assessment::class);
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
