<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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

        $perPage = $request->get('per_page', 20);
        return response()->json($query->paginate($perPage));
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
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
            $validated['image'] = $imagePath;
        }

        $product = Product::create($validated);
        return response()->json($product->load(['category', 'supplier']), 201);
    }

    public function update(Request $request, Product $product) {
        $validated = $request->validate([
            'name' => 'string',
            'prix_achat' => 'numeric|min:0',
            'prix_vente' => 'numeric|min:0',
            'stock' => 'integer|min:0',
            'min_stock_alert' => 'integer|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($request->hasFile('image')) {
            // Supprimer l'ancienne image si elle existe
            if ($product->image && Storage::disk('public')->exists($product->image)) {
                Storage::disk('public')->delete($product->image);
            }
            $imagePath = $request->file('image')->store('products', 'public');
            $validated['image'] = $imagePath;
        }

        $product->update($validated);
        return response()->json($product->load(['category', 'supplier']));
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
