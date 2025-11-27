<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique()->nullable();
            $table->text('description')->nullable();
            $table->foreignId('category_id')->constrained('product_categories');
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers');
            $table->decimal('prix_achat', 12, 2);
            $table->decimal('prix_vente', 12, 2);
            $table->integer('stock')->default(0);
            $table->integer('min_stock_alert')->default(5);
            $table->string('image')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
            
            $table->index('category_id');
            $table->index('supplier_id');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
}; 