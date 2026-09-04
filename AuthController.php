<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Employee;
use App\Models\Attendance;
use App\Models\Holiday;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class AuthController extends Controller
{
    public function register(Request $request)
{
    $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email',
        'phone' => 'nullable|string|max:20',
        'role' => 'required|in:admin,hr,employee',
        'address' => 'nullable|string',
        'password' => 'required|min:6|confirmed',
    ]);

    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'phone' => $request->phone,
        'role' => $request->role,
        'address' => $request->address,
        'password' => bcrypt($request->password),
    ]);

    if ($request->role === 'employee') {
        \App\Models\Employee::create([
            'user_id' => $user->id,
            'designation' => 'N/A',
            'joining_date' => now(),
            'salary' => 0,
        ]);
    }

    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'message' => 'Register Success',
        'token' => $token,
        'user' => $user
    ], 201);
}

    public function login(Request $request)
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid login details'
            ], 401);
        }
        $user = User::where('email', $request['email']) ?? abort(404);
        $user = $user->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        if ($user->role === 'employee') {
            $employee = Employee::where('user_id', $user->id)->first();
            if ($employee) {
                $existing = Attendance::where('employee_id', $employee->id)
                    ->where('date', Carbon::today()->toDateString())
                    ->first();
                if (!$existing) {
                    $isHoliday = Holiday::matchesEmployeeOnDate($employee, Carbon::today());
                    $now = Carbon::now();
                    if ($isHoliday) {
                        $status = 'Holiday';
                        $checkIn = null;
                    } else {
                        $checkIn = $now->toTimeString();
                        $status = ($now->format('H:i:s') > '09:15:00') ? 'Late' : 'Present';
                    }
                    Attendance::create([
                        'employee_id' => $employee->id,
                        'date'        => Carbon::today()->toDateString(),
                        'check_in'    => $checkIn,
                        'status'      => $status,
                    ]);
                }
            }
        }

        return response()->json([
            'message' => 'Hi '.$user->name.', welcome to home',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

     public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);
        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }
        $otp = rand(100000, 999999);
        $user->otp = $otp;
        $user->save();
        Mail::raw(
            "Your OTP is: ".$otp,
            function ($message) use ($user) {
                $message->to($user->email)
                        ->subject('Password Reset OTP');
            }
        );
        return response()->json([
            'message' => 'OTP sent successfully'
        ]);
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required'
        ]);
        $user = User::where('email', $request->email)
                    ->where('otp', $request->otp)
                    ->first();
        if (!$user) {
            return response()->json([
                'message' => 'Invalid OTP'
            ], 400);
        }
        return response()->json([
            'message' => 'OTP verified successfully'
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required',
            'password' => 'required|min:8|confirmed'
        ]);
        $user = User::where('email', $request->email)
                    ->where('otp', $request->otp)
                    ->first();
        if (!$user) {
            return response()->json([
                'message' => 'Invalid OTP'
            ], 400);
        }
        $user->password = Hash::make($request->password);
        $user->otp = null;
        $user->save();
        return response()->json([
            'message' => 'Password reset successfully'
        ]);
    }

    public function logout()
    {
        auth()->user()->tokens()->delete();
        return [
            'message' => 'You have successfully logged out and the token was successfully deleted'
        ];
    }
}
