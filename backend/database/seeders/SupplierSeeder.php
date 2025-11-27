<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Supplier;
class SupplierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        Supplier::create([
            'name' => 'Fournisseur A - Wax & Tissus',
            'contact' => 'Amadou',
            'phone' => '+221 77 111 1111',
            'email' => 'fournisseur_a@example.com',
            'address' => 'Dakar Marché Sandaga',
        ]);

        Supplier::create([
            'name' => 'Fournisseur B - Articles Divers',
            'contact' => 'Aïssatou',
            'phone' => '+221 78 222 2222',
            'email' => 'fournisseur_b@example.com',
            'address' => 'Thiès Centre Ville',
        ]);

        Supplier::create([
            'name' => 'Fournisseur C - Accessoires',
            'contact' => 'Moussa',
            'phone' => '+221 79 333 3333',
            'email' => 'fournisseur_c@example.com',
            'address' => 'Kaolack',
        ]);
    }
}
