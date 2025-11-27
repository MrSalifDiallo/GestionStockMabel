<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request) {
        $query = Product::with(['category', 'supplier']);

        if ($request->has('category')) {
            $query->where('category_id', $request->category);
        }
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }
        if ($request->has('stock_status')) {
            $status = $request->stock_status;
            if ($status === 'ok') {
                $query->whereRaw('stock > min_stock_alert');
            } elseif ($status === 'warning') {
                $query->whereRaw('stock <= min_stock_alert AND stock > 0');
            } elseif ($status === 'danger') {
                $query->where('stock', '<=', 0);
            }
        }

        return response()->json($query->get());
    }

    public function show(Product $product) {
        return response()->json($product->load(['category', 'supplier']));
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'name' => 'required|string',
            'code' => 'nullable|unique:products',
            'category_id' => 'required|exists:product_categories,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'prix_achat' => 'required|numeric|min:0',
            'prix_vente' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'min_stock_alert' => 'integer|min:0',
        ]);

        $product = Product::create($validated);
        return response()->json($product, 201);
    }

    public function update(Request $request, Product $product) {
        $validated = $request->validate([
            'name' => 'string',
            'prix_achat' => 'numeric|min:0',
            'prix_vente' => 'numeric|min:0',
            'stock' => 'integer|min:0',
            'min_stock_alert' => 'integer|min:0',
        ]);

        $product->update($validated);
        return response()->json($product);
    }

    public function destroy(Product $product) {
        $product->delete();
        return response()->json(null, 204);
    }

    public function stockAlerts() {
        $products = Product::where('stock', '<=', 5)->orderBy('stock', 'asc')->get();
        return response()->json($products);
    }
}
