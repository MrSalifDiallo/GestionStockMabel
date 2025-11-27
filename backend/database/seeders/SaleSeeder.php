<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\User;
use App\Models\Client;
use App\Models\Product;
class SaleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $seller = User::where('role', 'seller')->first();
        $client1 = Client::first();

        $sale = Sale::create([
            'invoice_number' => '250127-0001',
            'seller_id' => $seller->id,
            'client_id' => $client1->id,
            'sale_date' => now(),
            'subtotal' => 200000,
            'discount_amount' => 10000,
            'total' => 190000,
            'amount_paid' => 190000,
            'amount_due' => 0,
            'payment_status' => 'paid',
        ]);

        $product = Product::first();
        SaleItem::create([
            'sale_id' => $sale->id,
            'product_id' => $product->id,
            'quantity' => 2,
            'unit_price' => $product->prix_vente,
            'discount_percent' => 5,
            'line_total' => ($product->prix_vente * 2) * 0.95,
        ]);
    }
}
