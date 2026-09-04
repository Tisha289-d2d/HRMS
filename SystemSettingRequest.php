<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class SystemSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $type = $this->route('type');

        return match ($type) {
            'company' => $this->companyRules(),
            'email' => $this->emailRules(),
            'notification' => $this->notificationRules(),
            'attendance' => $this->attendanceRules(),
            'leave' => $this->leaveRules(),
            'payroll' => $this->payrollRules(),
            'security' => $this->securityRules(),
            'appearance' => $this->appearanceRules(),
            'backup' => $this->backupRules(),
            default => [],
        };
    }

    protected function companyRules(): array
    {
        return [
            'company_name' => 'nullable|string|max:255',
            'company_code' => 'nullable|string|max:100',
            'company_email' => 'nullable|email|max:255',
            'company_phone' => 'nullable|string|max:50',
            'company_website' => 'nullable|url|max:255',
            'company_address' => 'nullable|string',
            'company_city' => 'nullable|string|max:100',
            'company_state' => 'nullable|string|max:100',
            'company_country' => 'nullable|string|max:100',
            'company_zipcode' => 'nullable|string|max:20',
            'company_logo' => 'nullable|image|mimes:jpg,jpeg,png,svg|max:2048',
            'company_favicon' => 'nullable|image|mimes:ico,png,svg|max:1024',
            'tax_number' => 'nullable|string|max:100',
            'registration_number' => 'nullable|string|max:100',
        ];
    }

    protected function emailRules(): array
    {
        return [
            'mail_driver' => 'nullable|string|in:smtp,sendmail,mailgun,log',
            'mail_host' => 'nullable|string|max:255',
            'mail_port' => 'nullable|string|max:10',
            'mail_username' => 'nullable|string|max:255',
            'mail_password' => 'nullable|string|max:255',
            'mail_encryption' => 'nullable|string|in:tls,ssl,null',
            'sender_name' => 'nullable|string|max:255',
            'sender_email' => 'nullable|email|max:255',
        ];
    }

    protected function notificationRules(): array
    {
        return [
            'enable_email_notifications' => 'nullable|boolean',
            'enable_push_notifications' => 'nullable|boolean',
            'enable_leave_notifications' => 'nullable|boolean',
            'enable_attendance_notifications' => 'nullable|boolean',
            'enable_payroll_notifications' => 'nullable|boolean',
            'enable_announcement_notifications' => 'nullable|boolean',
        ];
    }

    protected function attendanceRules(): array
    {
        return [
            'office_start_time' => 'nullable|date_format:H:i',
            'office_end_time' => 'nullable|date_format:H:i',
            'grace_period' => 'nullable|integer|min:0|max:120',
            'late_mark_after' => 'nullable|date_format:H:i',
            'half_day_after' => 'nullable|date_format:H:i',
            'overtime_enabled' => 'nullable|boolean',
        ];
    }

    protected function leaveRules(): array
    {
        return [
            'annual_leave' => 'nullable|integer|min:0|max:365',
            'sick_leave' => 'nullable|integer|min:0|max:365',
            'casual_leave' => 'nullable|integer|min:0|max:365',
            'maternity_leave' => 'nullable|integer|min:0|max:365',
            'paternity_leave' => 'nullable|integer|min:0|max:365',
            'carry_forward_enabled' => 'nullable|boolean',
        ];
    }

    protected function payrollRules(): array
    {
        return [
            'salary_cycle' => 'nullable|string|in:monthly,bi-weekly,weekly',
            'payroll_generation_day' => 'nullable|integer|min:1|max:31',
            'tax_percentage' => 'nullable|numeric|min:0|max:100',
            'pf_percentage' => 'nullable|numeric|min:0|max:100',
            'esi_percentage' => 'nullable|numeric|min:0|max:100',
        ];
    }

    protected function securityRules(): array
    {
        return [
            'min_password_length' => 'nullable|integer|min:4|max:100',
            'password_expiry_days' => 'nullable|integer|min:0|max:999',
            'session_timeout' => 'nullable|integer|min:1|max:999',
            'max_login_attempts' => 'nullable|integer|min:1|max:99',
            'enable_2fa' => 'nullable|boolean',
        ];
    }

    protected function appearanceRules(): array
    {
        return [
            'theme_mode' => 'nullable|string|in:light,dark,auto',
            'primary_color' => 'nullable|string|max:20',
            'secondary_color' => 'nullable|string|max:20',
            'sidebar_logo' => 'nullable|image|mimes:jpg,jpeg,png,svg,webp|max:2048',
            'login_logo' => 'nullable|image|mimes:jpg,jpeg,png,svg,webp|max:2048',
            'login_banner' => 'nullable|image|mimes:jpg,jpeg,png,svg,webp|max:2048',
        ];
    }

    protected function backupRules(): array
    {
        return [
            'backup_frequency' => 'nullable|string|in:daily,weekly,monthly,manual',
            'storage_location' => 'nullable|string|max:255',
            'retention_days' => 'nullable|integer|min:1|max:365',
            'auto_backup' => 'nullable|boolean',
        ];
    }
}
