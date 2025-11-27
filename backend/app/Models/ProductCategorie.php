<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductCategorie extends Model
{
    //
    protected $fillable = ['name', 'description', 'icon', 'active'];

    public function products() {
        return $this->hasMany(Product::class, 'category_id');
    }

}
