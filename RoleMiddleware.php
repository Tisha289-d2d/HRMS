<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $roles  Pipe separated list of allowed roles (e.g. "admin|hr|employee")
     * @return mixed
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        // Ensure the user is authenticated
        $user = Auth::user();
        if (! $user) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        // Collect all allowed roles (supporting both variadic comma-separated and pipe-separated arguments)
        $allowed = [];
        foreach ($roles as $role) {
            $role = str_replace(',', '|', $role);
            $allowed = array_merge($allowed, explode('|', $role));
        }

        // Check if the authenticated user's role is in the allowed list
        if (! in_array($user->role, $allowed)) {
            return response()->json([
                'message' => 'Unauthorized. Access denied.'
            ], 403);
        }

        return $next($request);
    }
}
