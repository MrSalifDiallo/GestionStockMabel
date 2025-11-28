<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    //
    protected $fillable = [
        'invoice_number', 'seller_id', 'client_id', 'client_name',
        'sale_date', 'subtotal', 'discount_amount', 'total',
        'amount_paid', 'amount_due', 'payment_status', 'notes'
    ];

    protected $casts = [
        'sale_date' => 'date',
        'subtotal' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'amount_due' => 'decimal:2',
    ];

    public function seller() {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function client() {
        return $this->belongsTo(Client::class);
    }

    public function items() {
        return $this->hasMany(SaleItem::class);
    }

    public static function generateInvoiceNumber() {
        $date = now()->format('ymd');
        $count = self::whereDate('created_at', today())->count() + 1;
        return $date . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
    }
    
}
