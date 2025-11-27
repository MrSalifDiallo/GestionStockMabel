<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Expense;;
use App\Models\ExpenseCategorie;
use App\Models\User;
class ExpenseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $admin = User::first();
        $mercerie = ExpenseCategorie::where('name', 'Mercerie')->first();
        $transport = ExpenseCategorie::where('name', 'Transport')->first();

        Expense::create([
            'category_id' => $mercerie->id,
            'expense_date' => now(),
            'amount' => 120000,
            'description' => 'Tissus et fils',
            'created_by' => $admin->id,
        ]);

        Expense::create([
            'category_id' => $transport->id,
            'expense_date' => now(),
            'amount' => 15000,
            'description' => 'Livraison matières',
            'created_by' => $admin->id,
        ]);
    }
}
