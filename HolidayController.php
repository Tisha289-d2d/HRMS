<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Holiday;
use Illuminate\Http\Request;
use Carbon\Carbon;

class HolidayController extends Controller
{
    private function applyRoleAndDepartmentFilter($query, $user)
    {
        // Admin & HR see everything
        if (in_array($user->role, ['admin', 'hr'])) {
            return $query;
        }

        $employee      = \App\Models\Employee::where('user_id', $user->id)->first();
        $departmentIds = $employee ? $employee->departments()->pluck('departments.id')->toArray() : [];

        $query->where(function ($q) use ($user) {
            $q->whereNull('role_target')
              ->orWhere('role_target', '')
              ->orWhere('role_target', 'all')
              ->orWhere('role_target', $user->role);
        });

        $query->where(function ($q) use ($departmentIds) {
            $q->whereNull('department_id')
              ->orWhereIn('department_id', $departmentIds);
        });

        $query->where('is_approved', true);

        return $query;
    }

    public function index(Request $request)
    {
        $query = Holiday::with('department')->orderBy('holiday_date', 'asc');
        $query = $this->applyRoleAndDepartmentFilter($query, $request->user());

        if ($request->has('type') && $request->type !== '') {
            $query->where('type', $request->type);
        }
        if ($request->has('year')) {
            $query->whereYear('holiday_date', $request->year);
        }
        if ($request->has('month')) {
            $query->whereMonth('holiday_date', $request->month);
        }
        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        return response()->json(['data' => $query->get()]);
    }

    public function calendar(Request $request)
    {
        $query = Holiday::with('department');
        $query = $this->applyRoleAndDepartmentFilter($query, $request->user());
        $holidays = $query->get();

        $colors = [
            'public'     => '#3b82f6',
            'company'    => '#8b5cf6',
            'optional'   => '#f59e0b',
            'festival'   => '#ec4899',
            'restricted' => '#ef4444',
        ];

        $events = $holidays->map(fn($h) => [
            'id'              => $h->id,
            'title'           => $h->title,
            'start'           => $h->holiday_date,
            'backgroundColor' => $colors[$h->type] ?? '#8b5cf6',
            'borderColor'     => $colors[$h->type] ?? '#8b5cf6',
            'extendedProps'   => [
                'id'           => $h->id,
                'title'        => $h->title,
                'holiday_date' => $h->holiday_date,
                'type'         => $h->type,
                'is_optional'  => $h->is_optional,
                'is_recurring' => $h->is_recurring,
                'description'  => $h->description,
            ],
        ]);

        return response()->json($events);
    }

    public function stats(Request $request)
    {
        $year  = $request->input('year', date('Y'));
        $query = Holiday::whereYear('holiday_date', $year);
        $query = $this->applyRoleAndDepartmentFilter($query, $request->user());
        $holidays = $query->get();

        // Count by type field directly
        $byType = [
            'public'     => 0,
            'company'    => 0,
            'optional'   => 0,
            'festival'   => 0,
            'restricted' => 0,
        ];

        foreach ($holidays as $h) {
            $type = strtolower($h->type ?? 'company');
            if (isset($byType[$type])) {
                $byType[$type]++;
            } else {
                $byType['company']++;
            }
        }

        $byMonth = [];
        foreach ($holidays as $h) {
            $month = Carbon::parse($h->holiday_date)->format('M');
            $byMonth[$month] = ($byMonth[$month] ?? 0) + 1;
        }

        $stats = [
            'total'      => $holidays->count(),
            'upcoming'   => $holidays->filter(fn($h) => $h->holiday_date >= date('Y-m-d'))->count(),
            'public'     => $byType['public'],
            'company'    => $byType['company'],
            'optional'   => $byType['optional'],
            'festival'   => $byType['festival'],
            'restricted' => $byType['restricted'],
            'by_month'   => $byMonth,
        ];

        return response()->json($stats);
    }

    public function upcoming(Request $request)
    {
        $limit = $request->input('limit', 5);
        $query = Holiday::with('department')
            ->where('holiday_date', '>=', date('Y-m-d'))
            ->orderBy('holiday_date', 'asc')
            ->take($limit);

        $query = $this->applyRoleAndDepartmentFilter($query, $request->user());
        return response()->json(['data' => $query->get()]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'         => 'required|string|max:255',
            'holiday_date'  => 'required|date',
            'type'          => 'required|string|in:public,company,optional,festival,restricted',
            'description'   => 'nullable|string',
            'department_id' => 'nullable|exists:departments,id',
            'role_target'   => 'nullable|string',
            'is_optional'   => 'boolean',
            'is_recurring'  => 'boolean',
            'is_approved'   => 'boolean',
        ]);

        $holiday = Holiday::create($validated);
        return response()->json($holiday, 201);
    }

    public function update(Request $request, $id)
    {
        $holiday   = Holiday::findOrFail($id);
        $validated = $request->validate([
            'title'         => 'sometimes|required|string|max:255',
            'holiday_date'  => 'sometimes|required|date',
            'type'          => 'sometimes|required|string|in:public,company,optional,festival,restricted',
            'description'   => 'nullable|string',
            'department_id' => 'nullable|exists:departments,id',
            'role_target'   => 'nullable|string',
            'is_optional'   => 'boolean',
            'is_recurring'  => 'boolean',
            'is_approved'   => 'boolean',
        ]);

        $holiday->update($validated);
        return response()->json($holiday);
    }

    public function destroy($id)
    {
        $holiday = Holiday::findOrFail($id);
        $holiday->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }

    public function approve($id)
    {
        $holiday = Holiday::findOrFail($id);
        $holiday->is_approved = true;
        $holiday->save();
        return response()->json(['message' => 'Approved successfully']);
    }
}
