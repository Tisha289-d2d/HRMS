<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\AppearanceSetting;
use App\Models\AttendanceSetting;
use App\Models\BackupHistory;
use App\Models\BackupSetting;
use App\Models\CompanySetting;
use App\Models\EmailSetting;
use App\Models\LeaveSetting;
use App\Models\NotificationSetting;
use App\Models\PayrollSetting;
use App\Models\SecuritySetting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class SystemSettingService
{
    protected array $cacheKeys = [
        'company' => 'settings.company',
        'email' => 'settings.email',
        'notification' => 'settings.notification',
        'attendance' => 'settings.attendance',
        'leave' => 'settings.leave',
        'payroll' => 'settings.payroll',
        'security' => 'settings.security',
        'appearance' => 'settings.appearance',
        'backup' => 'settings.backup',
    ];

    protected array $modelMap = [
        'company' => CompanySetting::class,
        'email' => EmailSetting::class,
        'notification' => NotificationSetting::class,
        'attendance' => AttendanceSetting::class,
        'leave' => LeaveSetting::class,
        'payroll' => PayrollSetting::class,
        'security' => SecuritySetting::class,
        'appearance' => AppearanceSetting::class,
        'backup' => BackupSetting::class,
    ];

    public function get(string $type)
    {
        $modelClass = $this->modelMap[$type] ?? null;
        if (!$modelClass) return null;

        return Cache::remember($this->cacheKeys[$type], 3600, function () use ($modelClass) {
            return $modelClass::first();
        });
    }

    public function update(string $type, array $data, $user = null): mixed
    {
        $modelClass = $this->modelMap[$type] ?? null;
        if (!$modelClass) return null;

        return DB::transaction(function () use ($modelClass, $type, $data, $user) {
            $setting = $modelClass::first();

            if ($setting) {
                if ($user) $data['updated_by'] = $user->id;
                $setting->update($data);
            } else {
                if ($user) {
                    $data['created_by'] = $user->id;
                    $data['updated_by'] = $user->id;
                }
                $setting = $modelClass::create($data);
            }

            Cache::forget($this->cacheKeys[$type]);

            ActivityLog::create([
                'user_id' => $user?->id,
                'activity' => "Updated " . ucfirst($type) . " settings",
                'ip_address' => request()->ip(),
            ]);

            return $setting->fresh();
        });
    }

    public function uploadFile($file, string $path, string $type): string
    {
        $filename = $type . '_' . time() . '.' . $file->getClientOriginalExtension();
        return $file->storeAs($path, $filename, 'public');
    }

    public function sendTestEmail(array $config): bool
    {
        try {
            Mail::raw('This is a test email from your HRMS system settings.', function ($message) use ($config) {
                $message->to($config['sender_email'])
                    ->subject('Test Email - HRMS Settings');
            });
            return true;
        } catch (\Exception $e) {
            throw $e;
        }
    }

    public function runBackup($user): BackupHistory
    {
        return DB::transaction(function () use ($user) {
            $setting = BackupSetting::first();
            $filename = 'backup_' . now()->format('Y_m_d_His') . '.sql';
            $path = 'backups/' . $filename;

            $history = BackupHistory::create([
                'backup_setting_id' => $setting?->id,
                'file_name' => $filename,
                'file_path' => $path,
                'status' => 'in_progress',
                'started_at' => now(),
                'created_by' => $user?->id,
            ]);

            try {
                $db = config('database.connections.mysql');
                $sqlPath = storage_path('app/public/' . $path);
                $dir = dirname($sqlPath);
                if (!is_dir($dir)) mkdir($dir, 0755, true);

                $command = sprintf(
                    'mysqldump --user=%s --password=%s --host=%s %s > %s 2>&1',
                    escapeshellarg($db['username']),
                    escapeshellarg($db['password']),
                    escapeshellarg($db['host']),
                    escapeshellarg($db['database']),
                    escapeshellarg($sqlPath)
                );
                exec($command, $output, $resultCode);

                if ($resultCode !== 0) throw new \Exception('Backup failed');

                $history->update([
                    'status' => 'success',
                    'file_size' => file_exists($sqlPath) ? filesize($sqlPath) : 0,
                    'completed_at' => now(),
                ]);

                if ($setting) {
                    $setting->update([
                        'last_backup_date' => now(),
                        'updated_by' => $user?->id,
                    ]);
                    Cache::forget($this->cacheKeys['backup']);
                }

                ActivityLog::create([
                    'user_id' => $user?->id,
                    'activity' => "Database backup created successfully",
                    'ip_address' => request()->ip(),
                ]);
            } catch (\Exception $e) {
                $history->update([
                    'status' => 'failed',
                    'completed_at' => now(),
                ]);
                throw $e;
            }

            return $history;
        });
    }

    public function getBackupHistory(int $limit = 20)
    {
        return BackupHistory::latest()->take($limit)->get();
    }

    public function getDashboardStats(): array
    {
        $company = CompanySetting::first();
        $email = EmailSetting::first();
        $backup = BackupSetting::first();
        $security = SecuritySetting::first();

        return [
            'company_profile' => $company ? !empty($company->company_name) : false,
            'email_configured' => $email ? !empty($email->mail_host) : false,
            'backup_configured' => $backup ? $backup->auto_backup : false,
            'last_backup' => $backup?->last_backup_date,
            'security_2fa' => $security?->enable_2fa ?? false,
            'backup_history_count' => BackupHistory::count(),
        ];
    }
}
