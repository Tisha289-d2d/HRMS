<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Training extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'trainer_id',
        'title',
        'description',
        'start_date',
        'end_date',
        'location',
        'meeting_link',
        'mode',
        'status',
        'created_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function trainer()
    {
        return $this->belongsTo(Employee::class, 'trainer_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function assignments()
    {
        return $this->hasMany(TrainingAssignment::class);
    }

    public function attendance()
    {
        return $this->hasMany(TrainingAttendance::class);
    }

    public function assessments()
    {
        return $this->hasMany(Assessment::class);
    }

    public function certificates()
    {
        return $this->hasMany(Certificate::class);
    }
}
