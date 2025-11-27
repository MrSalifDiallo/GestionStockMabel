<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaction::with('products');

        if ($request->has('date_start')) {
            $query->whereDate('created_at', '>=', $request->date_start);
        }

        if ($request->has('date_end')) {
            $query->whereDate('created_at', '<=', $request->date_end);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $transactions = $query->orderBy('created_at', 'desc')->get();

        return response()->json($transactions);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:vente,achat',
            'products' => 'required|array|min:1',
            'products.*.product_id' => 'required|exists:products,id',
            'products.*.quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        return DB::transaction(function () use ($request) {
            $total = 0;
            foreach ($request->products as $item) {
                $product = Product::find($item['product_id']);

                if ($request->type === 'vente') {
                    if ($product->stock < $item['quantity']) {
                        throw new \Exception('Stock insuffisant pour le produit ' . $product->name);
                    }
                    $product->decrement('stock', $item['quantity']);
                    $total += $product->prix_vente * $item['quantity'];
                } elseif ($request->type === 'achat') {
                    $product->increment('stock', $item['quantity']);
                    $total += $product->prix_achat * $item['quantity'];
                }
            }

            $transaction = Transaction::create([
                'type' => $request->type,
                'total' => $total,
            ]);

            foreach ($request->products as $item) {
                $transaction->products()->attach($item['product_id'], ['quantity' => $item['quantity']]);
            }

            return response()->json($transaction->load('products'), 201);
        });
    }

    public function show(Transaction $transaction)
    {
        return response()->json($transaction->load('products'));
    }

    public function stats()
    {
        $totalVentes = Transaction::where('type', 'vente')->sum('total');
        $nombreTransactions = Transaction::count();

        $moyenneParTransaction = $nombreTransactions > 0 ? $totalVentes / $nombreTransactions : 0;

        $ventesParJour = Transaction::where('type', 'vente')
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(total) as total'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'total_ventes' => $totalVentes,
            'nombre_transactions' => $nombreTransactions,
            'moyenne_par_transaction' => $moyenneParTransaction,
            'ventes_par_jour' => $ventesParJour,
        ]);
    }
} 