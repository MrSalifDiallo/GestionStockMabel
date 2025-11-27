<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Fournisseur;
use App\Models\ProductCategorie;
use App\Models\Supplier;
class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $robes = ProductCategorie::where('name', 'Robes')->first();
        $boubous = ProductCategorie::where('name', 'Boubous')->first();
        $tuniques = ProductCategorie::where('name', 'Tuniques')->first();
        $chemises = ProductCategorie::where('name', 'Chemises')->first();
        $accessories = ProductCategorie::where('name', 'Accessoires')->first();
        $supplier1 = Supplier::first();
        $supplier2 = Supplier::skip(1)->first();

        $products = [
            ['name' => 'Robe Ankara', 'code' => 'R_ANK_01', 'category_id' => $robes->id, 'supplier_id' => $supplier1->id, 'prix_achat' => 35000, 'prix_vente' => 85000, 'stock' => 12],
            ['name' => 'Robe Dentelle', 'code' => 'R_DEN_01', 'category_id' => $robes->id, 'supplier_id' => $supplier1->id, 'prix_achat' => 40000, 'prix_vente' => 95000, 'stock' => 8],
            ['name' => 'Boubou Bazin', 'code' => 'B_BAZ_01', 'category_id' => $boubous->id, 'supplier_id' => $supplier1->id, 'prix_achat' => 50000, 'prix_vente' => 120000, 'stock' => 8],
            ['name' => 'Boubou Wax', 'code' => 'B_WAX_01', 'category_id' => $boubous->id, 'supplier_id' => $supplier2->id, 'prix_achat' => 45000, 'prix_vente' => 110000, 'stock' => 5],
            ['name' => 'Tunique Wax', 'code' => 'T_WAX_01', 'category_id' => $tuniques->id, 'supplier_id' => $supplier1->id, 'prix_achat' => 20000, 'prix_vente' => 65000, 'stock' => 3],
            ['name' => 'Tunique Ankara', 'code' => 'T_ANK_01', 'category_id' => $tuniques->id, 'supplier_id' => $supplier2->id, 'prix_achat' => 18000, 'prix_vente' => 60000, 'stock' => 10],
            ['name' => 'Chemise Homme', 'code' => 'C_HOM_01', 'category_id' => $chemises->id, 'supplier_id' => $supplier2->id, 'prix_achat' => 15000, 'prix_vente' => 35000, 'stock' => 0],
            ['name' => 'Chemise Femme', 'code' => 'C_FEM_01', 'category_id' => $chemises->id, 'supplier_id' => $supplier1->id, 'prix_achat' => 17000, 'prix_vente' => 40000, 'stock' => 15],
            ['name' => 'Accessoires Mix', 'code' => 'A_MIX_01', 'category_id' => $accessories->id, 'supplier_id' => $supplier2->id, 'prix_achat' => 5000, 'prix_vente' => 15000, 'stock' => 25],
            ['name' => 'Sac à Main', 'code' => 'A_SAC_01', 'category_id' => $accessories->id, 'supplier_id' => $supplier1->id, 'prix_achat' => 15000, 'prix_vente' => 50000, 'stock' => 7],
        ];

        foreach ($products as $prod) {
            Product::create([...$prod, 'min_stock_alert' => 5]);
        }
    }
} 