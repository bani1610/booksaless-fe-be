<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin Booksales',
            'email' => 'admin@booksales.com',
            'password' => Hash::make('password123'),
            'is_admin' => true,
        ]);

        User::create([
            'name' => 'Customer Booksales',
            'email' => 'customer@booksales.com',
            'password' => Hash::make('password123'),
        ]);
    }
}
