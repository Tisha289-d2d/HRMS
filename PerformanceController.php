<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Performance;
use Illuminate\Http\Request;

class PerformanceController extends Controller
{
   
    public function index()
    {
        $performances = Performance::with('employee.user')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $performances
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string'
        ]);

        $performance = Performance::create([
            'employee_id' => $request->employee_id,
            'rating' => $request->rating,
            'review' => $request->review
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Performance created successfully',
            'data' => $performance
        ], 201);
    }

    public function show($id)
    {
        $performance = Performance::with('employee.user')
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $performance
        ]);
    }

    public function update(Request $request, $id)
    {
        $performance = Performance::findOrFail($id);

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string'
        ]);

        $performance->update([
            'rating' => $request->rating,
            'review' => $request->review
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Performance updated successfully',
            'data' => $performance
        ]);
    }

    public function destroy($id)
    {
        $performance = Performance::findOrFail($id);

        $performance->delete();

        return response()->json([
            'success' => true,
            'message' => 'Performance deleted successfully'
        ]);
    }

    public function myPerformance(Request $request)
    {
        $employee = $request->user()->employee;
        
        if (!$employee) {
            return response()->json(['success' => true, 'data' => []]);
        }

        $performances = Performance::where('employee_id', $employee->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $performances
        ]);
    }
}