<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Fournisseur;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $fournisseurA = Fournisseur::where('name', 'Fournisseur A')->first();
        $fournisseurB = Fournisseur::where('name', 'Fournisseur B')->first();

        if ($fournisseurA && $fournisseurB) {
            Product::create([
                'name' => 'Chaussures de Sport',
                'description' => 'Chaussures confortables pour la course à pied.',
                'prix_achat' => 50.00,
                'prix_vente' => 80.00,
                'stock' => 100,
                'image' => 'https://example.com/chaussures.jpg',
                'fournisseur_id' => $fournisseurA->id,
            ]);

            Product::create([
                'name' => 'Sac à Dos Tactique',
                'description' => 'Sac à dos robuste et multifonctionnel.',
                'prix_achat' => 30.00,
                'prix_vente' => 60.00,
                'stock' => 50,
                'image' => 'https://example.com/sacados.jpg',
                'fournisseur_id' => $fournisseurB->id,
            ]);

            Product::create([
                'name' => 'Casque Audio Bluetooth',
                'description' => 'Casque avec excellente qualité sonore et suppression du bruit.',
                'prix_achat' => 70.00,
                'prix_vente' => 120.00,
                'stock' => 30,
                'image' => 'https://example.com/casque.jpg',
                'fournisseur_id' => $fournisseurA->id,
            ]);
        }
    }
} 