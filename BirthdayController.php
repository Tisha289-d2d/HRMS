<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\BirthdayResource;
use App\Services\BirthdayService;
use Illuminate\Http\Request;

class BirthdayController extends Controller
{
    protected BirthdayService $birthdayService;

    public function __construct(BirthdayService $birthdayService)
    {
        $this->birthdayService = $birthdayService;
    }

    public function index(Request $request)
    {
        $filters = $request->only(['department_id', 'month', 'search', 'per_page']);
        $birthdays = $this->birthdayService->getAllBirthdays($filters);
        return response()->json([
            'data' => BirthdayResource::collection($birthdays->items()),
            'meta' => [
                'current_page' => $birthdays->currentPage(),
                'last_page' => $birthdays->lastPage(),
                'total' => $birthdays->total(),
                'per_page' => $birthdays->perPage(),
            ],
        ]);
    }

    public function today()
    {
        $birthdays = $this->birthdayService->getTodaysBirthdays();
        return response()->json([
            'data' => BirthdayResource::collection($birthdays),
            'count' => $birthdays->count(),
        ]);
    }

    public function upcoming(Request $request)
    {
        $days = $request->input('days', 7);
        $birthdays = $this->birthdayService->getUpcomingBirthdays((int) $days);
        return response()->json([
            'data' => BirthdayResource::collection($birthdays),
        ]);
    }

    public function monthly(Request $request)
    {
        $month = $request->input('month');
        $birthdays = $this->birthdayService->getMonthlyBirthdays($month);
        return response()->json([
            'data' => BirthdayResource::collection($birthdays),
        ]);
    }

    public function monthlyReport(Request $request)
    {
        $year = $request->input('year');
        $report = $this->birthdayService->getMonthlyReport($year);
        return response()->json(['data' => $report]);
    }

    public function departmentReport()
    {
        $report = $this->birthdayService->getDepartmentReport();
        return response()->json(['data' => $report]);
    }

    public function upcomingReport(Request $request)
    {
        $days = $request->input('days', 30);
        $birthdays = $this->birthdayService->getUpcomingReport((int) $days);
        return response()->json([
            'data' => BirthdayResource::collection($birthdays),
        ]);
    }
}
