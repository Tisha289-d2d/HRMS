<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Shift;
use Illuminate\Http\Request;

class ShiftController extends Controller
{
    public function index()
    {
        return response()->json(Shift::all());
    }

    public function store(Request $request)
    {
        $shift = Shift::create($request->all());
        return response()->json($shift, 201);
    }

    public function show(string $id)
    {
        return response()->json(Shift::findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $shift = Shift::findOrFail($id);
        $shift->update($request->all());
        return response()->json($shift);
    }

    public function destroy(string $id)
    {
        Shift::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
