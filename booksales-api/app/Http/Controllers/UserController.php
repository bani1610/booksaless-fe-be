<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

// Kelola akun oleh admin
class UserController extends Controller
{
    private const MESSAGES = [
        'username.regex' => 'Username hanya boleh berisi huruf kecil, angka, titik, dan garis bawah.',
        'username.unique' => 'Username sudah dipakai.',
        'email.unique' => 'Email sudah terdaftar.',
    ];

    public function index()
    {
        $users = User::withCount('transactions')->orderByDesc('is_admin')->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'message' => 'List Data Users',
            'data' => $users
        ], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate($this->rules(), self::MESSAGES);

        $user = User::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'User Created Successfully',
            'data' => $user
        ], 201);
    }

    public function show(string $id)
    {
        $user = User::withCount('transactions')->find($id);

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User Not Found'], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail Data User',
            'data' => $user
        ], 200);
    }

    public function update(Request $request, string $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User Not Found'], 404);
        }

        $validated = $request->validate($this->rules($user), self::MESSAGES);

        // Admin tidak boleh mencabut perannya sendiri, supaya selalu ada minimal satu admin
        if ($user->is($request->user()) && array_key_exists('is_admin', $validated) && !$validated['is_admin']) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak dapat mencabut peran admin dari akun Anda sendiri.',
            ], 409);
        }

        // Password kosong saat ubah data berarti tidak diganti
        if (empty($validated['password'])) {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'User Updated Successfully',
            'data' => $user
        ], 200);
    }

    public function destroy(Request $request, string $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User Not Found'], 404);
        }

        if ($user->is($request->user())) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak dapat menghapus akun Anda sendiri.',
            ], 409);
        }

        // FK transactions.customer_id memakai cascade, jadi tanpa cek ini riwayat transaksi ikut terhapus
        if ($user->transactions()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Akun ini sudah memiliki transaksi sehingga tidak dapat dihapus.',
            ], 409);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User Deleted Successfully',
        ], 200);
    }

    private function rules(?User $user = null): array
    {
        // Saat ubah data, field boleh tidak dikirim; bila dikirim tetap wajib terisi
        $required = $user ? ['sometimes', 'required'] : ['required'];

        return [
            'name' => [...$required, 'string', 'min:3', 'max:255'],
            'username' => [
                ...$required, 'string', 'min:4', 'max:30', 'regex:/^[a-z0-9_.]+$/',
                Rule::unique('users', 'username')->ignore($user?->id),
            ],
            'email' => [...$required, 'email', 'max:255', Rule::unique('users', 'email')->ignore($user?->id)],
            'password' => $user ? 'nullable|string|min:8' : 'required|string|min:8',
            'is_admin' => 'sometimes|boolean',
        ];
    }
}
