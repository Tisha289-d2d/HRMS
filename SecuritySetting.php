<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SecuritySetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'min_password_length', 'password_expiry_days', 'session_timeout',
        'max_login_attempts', 'enable_2fa',
        'created_by', 'updated_by',
    ];

    protected $casts = [
        'enable_2fa' => 'boolean',
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
