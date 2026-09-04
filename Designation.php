<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Designation extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'title',
        'description',
    ];

    protected $appends = ['name'];

    public function getNameAttribute()
    {
        return $this->attributes['title'] ?? null;
    }
}
