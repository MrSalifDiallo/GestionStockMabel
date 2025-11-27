<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Fournisseur;
use App\Models\Product;
use App\Models\Transaction;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create specific Admin and Vendeur users
        User::factory()->admin()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
        ]);

        User::factory()->vendeur()->create([
            'name' => 'Vendeur User',
            'email' => 'vendeur@example.com',
        ]);

        // Generate additional random users
        User::factory(10)->create();

        // Generate fournisseurs
        Fournisseur::factory(5)->create();

        // Generate products
        Product::factory(50)->create();

        // Generate transactions (will also attach products through afterCreating callback in factory)
        Transaction::factory(100)->create();
    }
}
