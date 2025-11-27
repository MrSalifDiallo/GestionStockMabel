<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        User::create([
            'name' => 'Mabel Admin',
            'email' => 'admin@mabel.sn',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'phone' => '+221 77 123 4567',
        ]);

        User::create([
            'name' => 'Fatoumata Vendeur',
            'email' => 'fatou@mabel.sn',
            'password' => Hash::make('password123'),
            'role' => 'seller',
            'phone' => '+221 78 234 5678',
        ]);

        User::create([
            'name' => 'Aminata Vendeur',
            'email' => 'aminata@mabel.sn',
            'password' => Hash::make('password123'),
            'role' => 'seller',
            'phone' => '+221 79 345 6789',
        ]);
    }
}
