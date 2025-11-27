<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ExpenseCategorie;
class ExpenseCategorieSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
         $categories = [
            ['name' => 'Mercerie', 'type' => 'variable'],
            ['name' => 'Transport', 'type' => 'variable'],
            ['name' => 'Électricité', 'type' => 'fixed'],
            ['name' => 'Eau', 'type' => 'fixed'],
            ['name' => 'Tontine', 'type' => 'fixed'],
            ['name' => 'Salaires', 'type' => 'fixed'],
            ['name' => 'Loyer', 'type' => 'fixed'],
            ['name' => 'Marketing', 'type' => 'variable'],
            ['name' => 'Maintenance', 'type' => 'variable'],
            ['name' => 'Divers', 'type' => 'variable'],
        ];

        foreach ($categories as $cat) {
            ExpenseCategorie::create($cat);
        }
    }
}
