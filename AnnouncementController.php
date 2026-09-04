<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index()
    {
        return response()->json(Announcement::all());
    }

    public function store(Request $request)
    {
        $announcement = Announcement::create($request->all());
        return response()->json($announcement, 201);
    }

    public function show(string $id)
    {
        return response()->json(Announcement::findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $announcement = Announcement::findOrFail($id);
        $announcement->update($request->all());
        return response()->json($announcement);
    }

    public function destroy(string $id)
    {
        Announcement::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
