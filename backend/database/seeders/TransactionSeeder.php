<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class TransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminUser = User::where('role', 'admin')->first();
        $vendeurUser = User::where('role', 'vendeur')->first();
        $product1 = Product::where('name', 'Chaussures de Sport')->first();
        $product2 = Product::where('name', 'Sac à Dos Tactique')->first();
        $product3 = Product::where('name', 'Casque Audio Bluetooth')->first();

        if ($adminUser && $vendeurUser && $product1 && $product2 && $product3) {
            // Vente par un vendeur
            $transaction1 = Transaction::create([
                'user_id' => $vendeurUser->id,
                'type' => 'vente',
                'total' => 0, // Will be calculated
            ]);
            $transaction1->products()->attach($product1->id, ['quantity' => 2]);
            $transaction1->products()->attach($product2->id, ['quantity' => 1]);
            $transaction1->total = ($product1->prix_vente * 2) + ($product2->prix_vente * 1);
            $transaction1->save();

            // Achat par un admin
            $transaction2 = Transaction::create([
                'user_id' => $adminUser->id,
                'type' => 'achat',
                'total' => 0, // Will be calculated
            ]);
            $transaction2->products()->attach($product3->id, ['quantity' => 5]);
            $transaction2->total = $product3->prix_achat * 5;
            $transaction2->save();

            // Vente par un vendeur
            $transaction3 = Transaction::create([
                'user_id' => $vendeurUser->id,
                'type' => 'vente',
                'total' => 0, // Will be calculated
            ]);
            $transaction3->products()->attach($product1->id, ['quantity' => 1]);
            $transaction3->total = $product1->prix_vente * 1;
            $transaction3->save();
        }
    }
} 