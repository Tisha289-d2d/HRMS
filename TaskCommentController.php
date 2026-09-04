<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\TaskComment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskCommentController extends Controller
{
    public function index($taskId)
    {
        $comments = TaskComment::with('user')->where('task_id', $taskId)->orderBy('created_at', 'desc')->get();
        return response()->json(['data' => $comments]);
    }

    public function store(Request $request, $taskId)
    {
        $validated = $request->validate([
            'comment' => 'required|string',
        ]);

        $validated['task_id'] = $taskId;
        $validated['user_id'] = Auth::id();

        if ($request->hasFile('attachment')) {
            $path = $request->file('attachment')->store('task_comments', 'public');
            $validated['attachment'] = $path;
        }

        $comment = TaskComment::create($validated);
        $comment->load('user');

        return response()->json(['message' => 'Comment added', 'data' => $comment], 201);
    }

    public function destroy($taskId, $commentId)
    {
        $comment = TaskComment::where('task_id', $taskId)->findOrFail($commentId);
        
        // Only allow admin or the user who created it to delete
        if (Auth::user()->role !== 'admin' && Auth::id() !== $comment->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $comment->delete();
        return response()->json(['message' => 'Comment deleted']);
    }
}
