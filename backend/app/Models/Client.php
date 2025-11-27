<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    //
    protected $fillable = ['name', 'phone', 'email', 'address', 'measurements', 'active'];

    public function sales() {
        return $this->hasMany(Sale::class);
    }

    public function getTotalDueAttribute() {
        return $this->sales()->sum('amount_due');
    }

    public function getTotalPurchasedAttribute() {
        return $this->sales()->sum('total');
    }

    public function getTotalPaidAttribute() {
        return $this->sales()->sum('amount_paid');
    }
}
