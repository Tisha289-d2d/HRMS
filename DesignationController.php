<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Designation;
use Illuminate\Http\Request;

class DesignationController extends Controller
{
    public function index()
    {
        return response()->json(Designation::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'department_id' => 'nullable',
            'description' => 'nullable|string'
        ]);

        $data = $request->only(['description']);
        $data['title'] = $request->input('name');

        $designation = Designation::create($data);
        return response()->json($designation, 201);
    }

    public function show(string $id)
    {
        return response()->json(Designation::findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $designation = Designation::findOrFail($id);

        $data = $request->only(['description']);
        if ($request->has('name')) {
            $data['title'] = $request->input('name');
        }

        $designation->update($data);
        return response()->json($designation);
    }

    public function destroy(string $id)
    {
        Designation::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
