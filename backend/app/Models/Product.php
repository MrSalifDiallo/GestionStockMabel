<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;
protected $fillable = [
        'name', 'code', 'description', 'category_id', 'supplier_id',
        'prix_achat', 'prix_vente', 'stock', 'min_stock_alert', 'image', 'active'
    ];

    protected $casts = [
        'prix_achat' => 'decimal:2',
        'prix_vente' => 'decimal:2',
    ];

    public function category() {
        return $this->belongsTo(ProductCategorie::class);
    }

    public function supplier() {
        return $this->belongsTo(Supplier::class);
    }

    public function saleItems() {
        return $this->hasMany(SaleItem::class);
    }

    public function getMarginAttribute() {
        if ($this->prix_achat == 0) return 0;
        return round((($this->prix_vente - $this->prix_achat) / $this->prix_achat) * 100, 2);
    }

    public function getStockStatusAttribute() {
        if ($this->stock <= 0) return 'danger';
        if ($this->stock <= $this->min_stock_alert) return 'warning';
        return 'ok';
    }
} 