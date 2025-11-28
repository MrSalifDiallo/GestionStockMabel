<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    public function index(Request $request) {
        $query = Sale::with(['seller', 'client', 'items.product']);

        if ($request->has('status')) {
            $query->where('payment_status', $request->status);
        }
        if ($request->has('date_from')) {
            $query->whereDate('sale_date', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->whereDate('sale_date', '<=', $request->date_to);
        }

        $perPage = $request->get('per_page', 20);
        return response()->json($query->latest()->paginate($perPage));
    }

    public function show(Sale $sale) {
        return response()->json($sale->load(['seller', 'client', 'items.product']));
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'client_id' => 'nullable|exists:clients,id',
            'client_name' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.discount_percent' => 'numeric|min:0|max:100',
            'amount_paid' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $subtotal = 0;
            $totalItems = 0;

            foreach ($validated['items'] as $item) {
                $lineTotal = $item['quantity'] * $item['unit_price'];
                $discount = ($lineTotal * ($item['discount_percent'] ?? 0)) / 100;
                $subtotal += $lineTotal - $discount;
                $totalItems += $item['quantity'];
            }

            $autoDiscount = 0;
            if ($totalItems >= 10) {
                $autoDiscount = $subtotal * 0.10;
            } elseif ($totalItems >= 6) {
                $autoDiscount = $subtotal * 0.05;
            }

            $total = $subtotal - $autoDiscount;
            $amountDue = max(0, $total - $validated['amount_paid']);
            $paymentStatus = $validated['amount_paid'] >= $total ? 'paid' 
                            : ($validated['amount_paid'] > 0 ? 'partial' : 'pending');

            $sale = Sale::create([
                'invoice_number' => Sale::generateInvoiceNumber(),
                'seller_id' => auth()->check() ? auth()->id() : null,
                'client_id' => $validated['client_id'] ?? null,
                'client_name' => $validated['client_name'] ?? null,
                'sale_date' => now(),
                'subtotal' => $subtotal,
                'discount_amount' => $autoDiscount,
                'total' => $total,
                'amount_paid' => $validated['amount_paid'],
                'amount_due' => $amountDue,
                'payment_status' => $paymentStatus,
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                $lineTotal = $item['quantity'] * $item['unit_price'];
                $discount = ($lineTotal * ($item['discount_percent'] ?? 0)) / 100;

                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'discount_percent' => $item['discount_percent'] ?? 0,
                    'line_total' => $lineTotal - $discount,
                ]);

                Product::find($item['product_id'])->decrement('stock', $item['quantity']);
            }

            return response()->json($sale->load(['items.product']), 201);
        });
    }

    public function destroy(Sale $sale) {
        $sale->delete();
        return response()->json(null, 204);
    }
}
