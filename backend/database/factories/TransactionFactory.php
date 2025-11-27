<?php

namespace Database\Factories;

use App\Models\Transaction;
use App\Models\User;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransactionFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Transaction::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = $this->faker->randomElement(['vente', 'achat']);
        $user = User::inRandomOrder()->first();
        $product = Product::inRandomOrder()->first();
        $quantity = $this->faker->numberBetween(1, 10);

        $total = 0;
        if ($product) {
            if ($type === 'vente') {
                $total = $product->prix_vente * $quantity;
            } else {
                $total = $product->prix_achat * $quantity;
            }
        }

        return [
            'user_id' => $user ? $user->id : User::factory()->create()->id,
            'type' => $type,
            'total' => $total,
            'created_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'updated_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
        ];
    }

    /**
     * Configure the model factory.
     *
     * @return $this
     */
    public function configure()
    {
        return $this->afterCreating(function (Transaction $transaction) {
            // Attach products with random quantities
            $products = Product::inRandomOrder()->take($this->faker->numberBetween(1, 3))->get();
            foreach ($products as $product) {
                $quantity = $this->faker->numberBetween(1, 5);
                $transaction->products()->attach($product->id, ['quantity' => $quantity]);
            }
        });
    }
} 