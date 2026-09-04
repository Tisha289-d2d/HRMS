<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    public function index()
    {
        return response()->json(Branch::all());
    }

    public function store(Request $request)
    {
        $branch = Branch::create($request->all());
        return response()->json($branch, 201);
    }

    public function show(string $id)
    {
        return response()->json(Branch::findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $branch = Branch::findOrFail($id);
        $branch->update($request->all());
        return response()->json($branch);
    }

    public function destroy(string $id)
    {
        Branch::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
