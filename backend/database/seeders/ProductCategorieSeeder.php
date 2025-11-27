<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ProductCategorie;
class ProductCategorieSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
         $categories = [
            ['name' => 'Robes', 'icon' => '👗'],
            ['name' => 'Boubous', 'icon' => '👘'],
            ['name' => 'Tuniques', 'icon' => '👚'],
            ['name' => 'Chemises', 'icon' => '👔'],
            ['name' => 'Accessoires', 'icon' => '👜'],
        ];

        foreach ($categories as $cat) {
            ProductCategorie::create($cat);
        }
    }
}
