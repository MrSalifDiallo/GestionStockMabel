<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Fournisseur;

class FournisseurSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Fournisseur::create([
            'name' => 'Fournisseur A',
            'contact' => 'John Doe',
            'address' => '123 Rue de la Fourniture',
            'phone' => '0123456789',
            'email' => 'john.doe@example.com',
        ]);

        Fournisseur::create([
            'name' => 'Fournisseur B',
            'contact' => 'Jane Smith',
            'address' => '456 Avenue des Produits',
            'phone' => '0987654321',
            'email' => 'jane.smith@example.com',
        ]);
    }
} 