<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExpenseCategorie extends Model
{
    //
     protected $fillable = ['name', 'description', 'type', 'icon', 'active'];

    public function expenses() {
        return $this->hasMany(Expense::class, 'category_id');
    }
}
