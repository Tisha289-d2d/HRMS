<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\SystemSettingRequest;
use App\Services\SystemSettingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SystemSettingController extends Controller
{
    protected SystemSettingService $settingsService;

    public function __construct(SystemSettingService $settingsService)
    {
        $this->settingsService = $settingsService;
    }

    public function getCompany()
    {
        $settings = $this->settingsService->get('company');
        return response()->json($settings ?? []);
    }

    public function updateCompany(SystemSettingRequest $request)
    {
        $data = $request->except(['company_logo', 'company_favicon']);
        $user = $request->user();

        if ($request->hasFile('company_logo')) {
            $data['company_logo'] = $this->settingsService->uploadFile(
                $request->file('company_logo'), 'company', 'logo'
            );
        }

        if ($request->hasFile('company_favicon')) {
            $data['company_favicon'] = $this->settingsService->uploadFile(
                $request->file('company_favicon'), 'company', 'favicon'
            );
        }

        $settings = $this->settingsService->update('company', $data, $user);
        return response()->json(['message' => 'Company settings updated successfully', 'data' => $settings]);
    }

    public function getEmail()
    {
        $settings = $this->settingsService->get('email');
        return response()->json($settings ?? []);
    }

    public function updateEmail(SystemSettingRequest $request)
    {
        $data = $request->validated();
        $user = $request->user();
        $settings = $this->settingsService->update('email', $data, $user);
        return response()->json(['message' => 'Email settings updated successfully', 'data' => $settings]);
    }

    public function sendTestEmail(Request $request)
    {
        $request->validate([
            'sender_email' => 'required|email',
        ]);

        try {
            $this->settingsService->sendTestEmail($request->only('sender_email'));
            return response()->json(['message' => 'Test email sent successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to send test email: ' . $e->getMessage()], 500);
        }
    }

    public function getNotification()
    {
        $settings = $this->settingsService->get('notification');
        return response()->json($settings ?? []);
    }

    public function updateNotification(SystemSettingRequest $request)
    {
        $data = $request->validated();
        $user = $request->user();
        $settings = $this->settingsService->update('notification', $data, $user);
        return response()->json(['message' => 'Notification settings updated successfully', 'data' => $settings]);
    }

    public function getAttendance()
    {
        $settings = $this->settingsService->get('attendance');
        return response()->json($settings ?? []);
    }

    public function updateAttendance(SystemSettingRequest $request)
    {
        $data = $request->validated();
        $user = $request->user();
        $settings = $this->settingsService->update('attendance', $data, $user);
        return response()->json(['message' => 'Attendance settings updated successfully', 'data' => $settings]);
    }

    public function getLeave()
    {
        $settings = $this->settingsService->get('leave');
        return response()->json($settings ?? []);
    }

    public function updateLeave(SystemSettingRequest $request)
    {
        $data = $request->validated();
        $user = $request->user();
        $settings = $this->settingsService->update('leave', $data, $user);
        return response()->json(['message' => 'Leave settings updated successfully', 'data' => $settings]);
    }

    public function getPayroll()
    {
        $settings = $this->settingsService->get('payroll');
        return response()->json($settings ?? []);
    }

    public function updatePayroll(SystemSettingRequest $request)
    {
        $data = $request->validated();
        $user = $request->user();
        $settings = $this->settingsService->update('payroll', $data, $user);
        return response()->json(['message' => 'Payroll settings updated successfully', 'data' => $settings]);
    }

    public function getSecurity()
    {
        $settings = $this->settingsService->get('security');
        return response()->json($settings ?? []);
    }

    public function updateSecurity(SystemSettingRequest $request)
    {
        $data = $request->validated();
        $user = $request->user();
        $settings = $this->settingsService->update('security', $data, $user);
        return response()->json(['message' => 'Security settings updated successfully', 'data' => $settings]);
    }

    public function getAppearance()
    {
        $settings = $this->settingsService->get('appearance');
        return response()->json($settings ?? []);
    }

    public function updateAppearance(SystemSettingRequest $request)
    {
        $data = $request->except(['sidebar_logo', 'login_logo', 'login_banner']);
        $user = $request->user();

        foreach (['sidebar_logo', 'login_logo', 'login_banner'] as $field) {
            if ($request->hasFile($field)) {
                $data[$field] = $this->settingsService->uploadFile(
                    $request->file($field), 'appearance', $field
                );
            }
        }

        $settings = $this->settingsService->update('appearance', $data, $user);
        return response()->json(['message' => 'Appearance settings updated successfully', 'data' => $settings]);
    }

    public function getBackup()
    {
        $settings = $this->settingsService->get('backup');
        return response()->json($settings ?? []);
    }

    public function updateBackup(SystemSettingRequest $request)
    {
        $data = $request->validated();
        $user = $request->user();
        $settings = $this->settingsService->update('backup', $data, $user);
        return response()->json(['message' => 'Backup settings updated successfully', 'data' => $settings]);
    }

    public function runBackup(Request $request)
    {
        try {
            $history = $this->settingsService->runBackup($request->user());
            return response()->json(['message' => 'Backup created successfully', 'data' => $history]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Backup failed: ' . $e->getMessage()], 500);
        }
    }

    public function getBackupHistory()
    {
        $history = $this->settingsService->getBackupHistory();
        return response()->json($history);
    }

    public function getDashboardStats()
    {
        $stats = $this->settingsService->getDashboardStats();
        return response()->json($stats);
    }
}
