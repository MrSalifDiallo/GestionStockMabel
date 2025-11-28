<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index(Request $request) {
        $query = Expense::with(['category', 'creator']);

        if ($request->has('category')) {
            $query->where('category_id', $request->category);
        }
        if ($request->has('date_from')) {
            $query->whereDate('expense_date', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->whereDate('expense_date', '<=', $request->date_to);
        }

        $perPage = $request->get('per_page', 20);
        return response()->json($query->latest('expense_date')->paginate($perPage));
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'category_id' => 'required|exists:expense_categories,id',
            'amount' => 'required|numeric|min:0',
            'expense_date' => 'required|date',
            'description' => 'nullable|string',
            'reference' => 'nullable|string',
        ]);
        $user = $request->user();  // Retourne l'objet User complet

        $expense = Expense::create([
            ...$validated,
            'created_by' => $user->id,
        ]);

        return response()->json($expense->load('category'), 201);
    }

    public function update(Request $request, Expense $expense) {
        $validated = $request->validate([
            'amount' => 'numeric|min:0',
            'description' => 'string',
        ]);

        $expense->update($validated);
        return response()->json($expense);
    }

    public function destroy(Expense $expense) {
        $expense->delete();
        return response()->json(null, 204);
    }
}
