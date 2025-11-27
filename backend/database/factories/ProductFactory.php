<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Fournisseur;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Product::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $productNames = [
            'Boubou Traditionnel Homme',
            'Tunique Femme Brodé',
            'Ensemble Pagne et Chemise',
            'Robe Caftan Moderne',
            'Daraa Homme Simple',
            'Boubou Enfant Couleur',
            'Tunique Coton Léger',
            'Ensemble Deux Pièces Wax',
            'Chemise Africaine Classique',
            'Pantalon Sarouel Confortable',
        ];

        $description = [
            'Fabriqué avec des tissus locaux de qualité supérieure.',
            'Design élégant et motifs africains uniques.',
            'Idéal pour toutes les occasions, confortable et stylé.',
            'Confection artisanale, respectueuse des traditions.',
            'Parfait pour les cérémonies et les événements spéciaux.',
        ];

        return [
            'name' => $this->faker->randomElement($productNames),
            'description' => $this->faker->randomElement($description),
            'prix_achat' => $this->faker->randomFloat(2, 5000, 20000), // CFA
            'prix_vente' => $this->faker->randomFloat(2, 10000, 35000), // CFA
            'stock' => $this->faker->numberBetween(10, 200),
            'image' => $this->faker->imageUrl(640, 480, 'fashion', true, 'boubou'),
            'fournisseur_id' => Fournisseur::inRandomOrder()->first()->id,
        ];
    }
} 