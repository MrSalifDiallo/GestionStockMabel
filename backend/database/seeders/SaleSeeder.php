<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\User;
use App\Models\Client;
use App\Models\Product;
use Illuminate\Support\Facades\Log;

class SaleSeeder extends Seeder
{
    public function run(): void
    {
        Log::info('Starting Sale seeding...');
        
        $clients = Client::all();
        $sellers = User::where('role', 'seller')->get();
        
        Log::info("Clients trouvés: {$clients->count()}, Sellers: {$sellers->count()}");

        if ($clients->isEmpty() || $sellers->isEmpty()) {
            Log::info('Pas assez de clients/sellers, skip...');
            return;
        }

        foreach($sellers as $seller) {
            foreach($clients as $client) {
                // Vente d'aujourd'hui
                $sale = Sale::create([
                    'invoice_number' => '250127-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT),
                    'seller_id' => $seller->id,
                    'client_id' => $client->id,
                    'sale_date' => now(),
                    'subtotal' => 100000 + rand(0, 50000),
                    'discount_amount' => 5000 + rand(0, 5000),
                    'total' => 95000 + rand(0, 45000),
                    'amount_paid' => 95000 + rand(0, 45000),
                    'amount_due' => 0,
                    'payment_status' => 'paid',
                ]);
                
                Log::info("Sale créée: ID {$sale->id} pour client {$client->name}");

                // Item pour cette vente
                $product = Product::inRandomOrder()->first();
                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $product->id,
                    'quantity' => rand(1, 5),
                    'unit_price' => $product->prix_vente,
                    'discount_percent' => rand(0, 10),
                    'line_total' => ($product->prix_vente * rand(1, 5)) * (1 - rand(0, 10) / 100),
                ]);

                // 2 ventes passées
                for($i = 0; $i < 2; $i++) {
                    $pastSale = Sale::create([
                        'invoice_number' => '250127-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT),
                        'seller_id' => $seller->id,
                        'client_id' => $client->id,
                        'sale_date' => now()->subDays(rand(0, 30)),
                        'subtotal' => 100000 + rand(0, 50000),
                        'discount_amount' => 5000 + rand(0, 5000),
                        'total' => 95000 + rand(0, 45000),
                        'amount_paid' => 95000 + rand(0, 45000),
                        'amount_due' => 0,
                        'payment_status' => 'paid',
                    ]);

                    $pastProduct = Product::inRandomOrder()->first();
                    SaleItem::create([
                        'sale_id' => $pastSale->id,
                        'product_id' => $pastProduct->id,
                        'quantity' => rand(1, 5),
                        'unit_price' => $pastProduct->prix_vente,
                        'discount_percent' => rand(0, 10),
                        'line_total' => ($pastProduct->prix_vente * rand(1, 5)) * (1 - rand(0, 10) / 100),
                    ]);
                    
                    dump("Sale passée: ID {$pastSale->id}");
                }
            }
        }
        
        Log::info('Sale seeding TERMINÉE ! Total sales: ' . Sale::count());
    }
}
