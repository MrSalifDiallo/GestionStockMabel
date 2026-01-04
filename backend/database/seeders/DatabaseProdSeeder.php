<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseProdSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $this->call([
            UserSeeder::class,
            ProductCategorieSeeder::class,
            //SupplierSeeder::class,
            //ProductSeeder::class,
            //ClientSeeder::class,
            //ExpenseCategorieSeeder::class,
            //SaleSeeder::class,
            //ExpenseSeeder::class,
        ]);
    }
}
