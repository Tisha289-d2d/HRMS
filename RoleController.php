<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index()
    {
        return response()->json(User::select('id', 'name', 'email', 'role')->get());
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'role' => 'required|string|in:admin,hr,employee',
        ]);

        $user = User::findOrFail($id);
        $user->update(['role' => $request->role]);

        return response()->json($user);
    }
}
