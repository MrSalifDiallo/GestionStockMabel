<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'prix_achat',
        'prix_vente',
        'stock',
        'image',
        'fournisseur_id',
    ];

    protected $casts = [
        'prix_achat' => 'decimal:2',
        'prix_vente' => 'decimal:2',
        'stock' => 'integer',
    ];

    public function fournisseur()
    {
        return $this->belongsTo(Fournisseur::class);
    }

    public function transactions()
    {
        return $this->belongsToMany(Transaction::class, 'product_transaction')
            ->withPivot('quantity')
            ->withTimestamps();
    }

    public function getStockStatusAttribute()
    {
        if ($this->stock <= 0) {
            return 'rupture';
        } elseif ($this->stock <= 5) {
            return 'bas';
        }
        return 'normal';
    }
} 