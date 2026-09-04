<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AppearanceSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'theme_mode', 'primary_color', 'secondary_color',
        'sidebar_logo', 'login_logo', 'login_banner',
        'created_by', 'updated_by',
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
