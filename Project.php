<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_code',
        'project_name',
        'client_name',
        'description',
        'start_date',
        'end_date',
        'status',
        'priority',
        'budget',
        'progress_percentage',
        'project_manager_id',
        'created_by',
    ];

    public function manager()
    {
        return $this->belongsTo(Employee::class, 'project_manager_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function members()
    {
        return $this->hasMany(ProjectMember::class);
    }

    public function tasks()
    {
        return $this->hasMany(ProjectTask::class);
    }
}
