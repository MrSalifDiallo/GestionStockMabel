<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Créer l'admin seulement s'il n'existe pas déjà
        User::firstOrCreate(
            ['email' => 'admin@mabel.sn'],
            [
                'name' => 'Mabel Admin',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'phone' => '+221 77 543 8297',
            ]
        );

        // Créer les vendeurs seulement s'ils n'existent pas
        User::firstOrCreate(
            ['email' => 'fatou@mabel.sn'],
            [
                'name' => 'Fatoumata Vendeur',
                'password' => Hash::make('password123'),
                'role' => 'seller',
                'phone' => '+221 78 234 5678',
            ]
        );

        User::firstOrCreate(
            ['email' => 'aminata@mabel.sn'],
            [
                'name' => 'Aminata Vendeur',
                'password' => Hash::make('password123'),
                'role' => 'seller',
                'phone' => '+221 79 345 6789',
            ]
        );
    }
}
