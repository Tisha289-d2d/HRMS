<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BackupHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'backup_setting_id', 'file_name', 'file_path', 'file_size',
        'status', 'started_at', 'completed_at', 'created_by',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function backupSetting()
    {
        return $this->belongsTo(BackupSetting::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
