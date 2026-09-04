<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBirthdayWishRequest;
use App\Http\Resources\BirthdayWishResource;
use App\Models\BirthdayWish;
use App\Models\ActivityLog;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BirthdayWishController extends Controller
{
    public function index(Request $request)
    {
        $query = BirthdayWish::with(['employee.user', 'wishers.user']);

        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        $wishes = $query->latest()->paginate($request->per_page ?? 20);
        return response()->json([
            'data' => BirthdayWishResource::collection($wishes->items()),
            'meta' => [
                'current_page' => $wishes->currentPage(),
                'last_page' => $wishes->lastPage(),
                'total' => $wishes->total(),
                'per_page' => $wishes->perPage(),
            ],
        ]);
    }

    public function store(StoreBirthdayWishRequest $request)
    {
        $user = Auth::user();
        $employee = Employee::where('user_id', $user->id)->first();

        if (!$employee) {
            return response()->json(['message' => 'Employee profile not found.'], 404);
        }

        $exists = BirthdayWish::where('employee_id', $request->employee_id)
            ->where('wished_by', $employee->id)
            ->whereDate('created_at', today())
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'You have already sent a wish today.'], 429);
        }

        $wish = BirthdayWish::create([
            'employee_id' => $request->employee_id,
            'wished_by' => $employee->id,
            'message' => $request->message,
        ]);

        ActivityLog::create([
            'user_id' => $user->id,
            'activity' => "Sent birthday wish to employee #{$request->employee_id}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Wish sent successfully!',
            'data' => new BirthdayWishResource($wish->load(['employee.user', 'wishers.user'])),
        ], 201);
    }

    public function received()
    {
        $user = Auth::user();
        $employee = Employee::where('user_id', $user->id)->first();

        if (!$employee) {
            return response()->json(['data' => []]);
        }

        $wishes = BirthdayWish::with(['employee.user', 'wishers.user'])
            ->where('employee_id', $employee->id)
            ->latest()
            ->get();

        return response()->json([
            'data' => BirthdayWishResource::collection($wishes),
        ]);
    }

    public function sent()
    {
        $user = Auth::user();
        $employee = Employee::where('user_id', $user->id)->first();

        if (!$employee) {
            return response()->json(['data' => []]);
        }

        $wishes = BirthdayWish::with(['employee.user', 'wishers.user'])
            ->where('wished_by', $employee->id)
            ->latest()
            ->get();

        return response()->json([
            'data' => BirthdayWishResource::collection($wishes),
        ]);
    }
}
