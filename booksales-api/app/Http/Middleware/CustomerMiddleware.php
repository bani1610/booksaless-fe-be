<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CustomerMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || $request->user()->is_admin) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden. Customer access required.',
            ], 403);
        }

        return $next($request);
    }
}
