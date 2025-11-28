<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('string'); // string, boolean, integer, decimal
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Insérer les paramètres par défaut pour la remise automatique
        DB::table('settings')->insert([
            [
                'key' => 'auto_discount_enabled',
                'value' => '1',
                'type' => 'boolean',
                'description' => 'Activer/désactiver la remise automatique',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'discount_tier_1_qty',
                'value' => '6',
                'type' => 'integer',
                'description' => 'Quantité minimale pour la remise de niveau 1',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'discount_tier_1_percent',
                'value' => '5',
                'type' => 'decimal',
                'description' => 'Pourcentage de remise de niveau 1',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'discount_tier_2_qty',
                'value' => '10',
                'type' => 'integer',
                'description' => 'Quantité minimale pour la remise de niveau 2',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'discount_tier_2_percent',
                'value' => '10',
                'type' => 'decimal',
                'description' => 'Pourcentage de remise de niveau 2',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
