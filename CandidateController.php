<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Candidate;
use Illuminate\Http\Request;

class CandidateController extends Controller
{
    public function index()
    {
        return response()->json(Candidate::all());
    }

    public function store(Request $request)
    {
        $candidate = Candidate::create($request->all());
        return response()->json($candidate, 201);
    }

    public function show(string $id)
    {
        return response()->json(Candidate::findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $candidate = Candidate::findOrFail($id);
        $candidate->update($request->all());
        return response()->json($candidate);
    }

    public function destroy(string $id)
    {
        Candidate::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
