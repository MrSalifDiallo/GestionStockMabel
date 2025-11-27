<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Client;
class ClientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $clients = [
            ['name' => 'Fatou Sall', 'phone' => '+221 77 234 5678', 'address' => 'Dakar'],
            ['name' => 'Aminata Diop', 'phone' => '+221 78 345 6789', 'address' => 'Thiès'],
            ['name' => 'Khadija Ndiaye', 'phone' => '+221 79 456 7890', 'address' => 'Saint-Louis'],
            ['name' => 'Marième Fall', 'phone' => '+221 77 567 8901', 'address' => 'Kaolack'],
            ['name' => 'Aïssatou Ba', 'phone' => '+221 78 678 9012', 'address' => 'Tambacounda'],
        ];

        foreach ($clients as $client) {
            Client::create($client);
        }
    }
}
