<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    //
     protected $fillable = ['category_id', 'expense_date', 'amount', 'description', 'reference', 'receipt', 'created_by'];

    protected $casts = [
        'expense_date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function category() {
        return $this->belongsTo(ExpenseCategorie::class);
    }

    public function creator() {
        return $this->belongsTo(User::class, 'created_by');
    }
}
