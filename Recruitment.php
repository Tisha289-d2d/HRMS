<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Recruitment extends Model
{
    protected $table = 'jobs';

    protected $fillable = [
        'title',
        'department',
        'location',
        'job_type',
        'salary',
        'vacancies',
        'status',
        'deadline',
        'description'
    ];
}