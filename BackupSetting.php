<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BackupSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'backup_frequency', 'last_backup_date', 'storage_location',
        'retention_days', 'auto_backup',
        'created_by', 'updated_by',
    ];

    protected $casts = [
        'last_backup_date' => 'datetime',
        'auto_backup' => 'boolean',
    ];

    public function backupHistories()
    {
        return $this->hasMany(BackupHistory::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
