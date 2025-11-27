<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create an Admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Create a Vendeur user
        User::create([
            'name' => 'Vendeur User',
            'email' => 'vendeur@example.com',
            'password' => Hash::make('password'),
            'role' => 'vendeur',
        ]);
    }
} 