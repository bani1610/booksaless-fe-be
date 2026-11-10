<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|min:3|max:255',
            'username' => ['required', 'string', 'min:4', 'max:30', 'regex:/^[a-z0-9_.]+$/', 'unique:users,username'],
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ], [
            'username.regex' => 'Username hanya boleh berisi huruf kecil, angka, titik, dan garis bawah.',
            'username.unique' => 'Username sudah dipakai.',
            'email.unique' => 'Email sudah terdaftar.',
            'password.confirmed' => 'Konfirmasi password tidak sama.',
        ]);

        $user = User::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Register Success',
            'data' => $user
        ], 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if (!$token = auth('api')->attempt($credentials)) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau password salah',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'message' => 'Login Success',
            'user' => auth('api')->user(),
            'token' => $token,
        ], 200);
    }

    // Data user dari token, dipakai frontend untuk memastikan peran (is_admin)
    public function me()
    {
        return response()->json([
            'success' => true,
            'message' => 'Get current user success',
            'data' => auth('api')->user(),
        ], 200);
    }

    public function logout()
    {
        auth('api')->logout();

        return response()->json([
            'success' => true,
            'message' => 'Logout Success',
        ], 200);
    }
}
