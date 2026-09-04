<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Recruitment;
use Illuminate\Http\Request;

class RecruitmentController extends Controller
{
    public function index()
    {
        try {

            $jobs = Recruitment::orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $jobs
            ]);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);

        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'department_id' => 'nullable',
            'location' => 'required|string',
            'type' => 'nullable|string',
            'experience_level' => 'nullable|string',
            'description' => 'nullable|string',
            'requirements' => 'nullable|string',
            'is_active' => 'nullable|boolean'
        ]);

        $data = $request->only(['title', 'location', 'description']);
        $data['job_type'] = $request->input('type');
        $data['status'] = $request->boolean('is_active') ? 'Open' : 'Closed';

        if ($request->filled('department_id')) {
            $dept = \App\Models\Department::find($request->department_id);
            $data['department'] = $dept ? $dept->name : $request->department_id;
        }

        $recruitment = Recruitment::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Recruitment created successfully',
            'data' => $recruitment
        ], 201);
    }

    public function show($id)
    {
        $recruitment = Recruitment::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $recruitment
        ]);
    }

    public function update(Request $request, $id)
    {
        $recruitment = Recruitment::findOrFail($id);

        $recruitment->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Recruitment updated successfully',
            'data' => $recruitment
        ]);
    }

    public function destroy($id)
    {
        $recruitment = Recruitment::findOrFail($id);

        $recruitment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Recruitment deleted successfully'
        ]);
    }
}