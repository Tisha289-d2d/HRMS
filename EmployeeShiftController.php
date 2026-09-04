<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\EmployeeShift;
use Illuminate\Http\Request;

class EmployeeShiftController extends Controller
{
    public function index()
    {
        return response()->json(EmployeeShift::with(['employee.user', 'shift'])->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'shift_id' => 'required|exists:shifts,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $employeeShift = EmployeeShift::create($request->only(['employee_id', 'shift_id', 'start_date', 'end_date']));
        return response()->json($employeeShift, 201);
    }

    public function show(string $id)
    {
        return response()->json(EmployeeShift::with(['employee.user', 'shift'])->findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $employeeShift = EmployeeShift::findOrFail($id);
        $employeeShift->update($request->only(['employee_id', 'shift_id', 'start_date', 'end_date']));
        return response()->json($employeeShift);
    }

    public function destroy(string $id)
    {
        EmployeeShift::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
