<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class EmailSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'mail_driver', 'mail_host', 'mail_port', 'mail_username',
        'mail_password', 'mail_encryption', 'sender_name', 'sender_email',
        'created_by', 'updated_by',
    ];

    protected $hidden = ['mail_password'];

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
