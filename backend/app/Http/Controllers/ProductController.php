<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;
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
        $products = $query->paginate($perPage);
        
        // Ajouter le chemin relatif de l'image pour chaque produit
        $products->getCollection()->transform(function ($product) {
            if ($product->image) {
                $product->image_url = '/storage/' . $product->image;
            }
            return $product;
        });
        
        return response()->json($products);
    }

    public function show(Product $product) {
        $product->load(['category', 'supplier']);
        
        // Ajouter le chemin relatif de l'image
        if ($product->image) {
            $product->image_url = '/storage/' . $product->image;
        }
        
        return response()->json($product);
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
        $product->load(['category', 'supplier']);
        
        // Ajouter le chemin relatif de l'image
        if ($product->image) {
            $product->image_url = '/storage/' . $product->image;
        }
        
        return response()->json($product, 201);
    }

    public function update(Request $request, Product $product) {
        // Laravel ne supporte pas les fichiers dans les requêtes PUT/PATCH
        // On doit donc utiliser POST avec _method=PUT
        // Vérifier si la méthode réelle est POST (workaround Laravel pour FormData)
        $actualMethod = $request->method();
        
        Log::info('Product update request', [
            'method' => $actualMethod,
            'has_file' => $request->hasFile('image'),
            'all_files' => $request->allFiles(),
            'all_data' => $request->all(),
            'product_id' => $product->id,
            'content_type' => $request->header('Content-Type'),
        ]);
        
        // Convertir les valeurs numériques depuis FormData (qui les envoie comme strings)
        $input = $request->except(['image', '_method']); // Exclure l'image et _method
        
        if (isset($input['prix_achat'])) {
            $input['prix_achat'] = is_numeric($input['prix_achat']) ? (float)$input['prix_achat'] : $input['prix_achat'];
        }
        if (isset($input['prix_vente'])) {
            $input['prix_vente'] = is_numeric($input['prix_vente']) ? (float)$input['prix_vente'] : $input['prix_vente'];
        }
        if (isset($input['stock'])) {
            $input['stock'] = is_numeric($input['stock']) ? (int)$input['stock'] : $input['stock'];
        }
        if (isset($input['min_stock_alert'])) {
            $input['min_stock_alert'] = is_numeric($input['min_stock_alert']) ? (int)$input['min_stock_alert'] : $input['min_stock_alert'];
        }
        if (isset($input['category_id'])) {
            $input['category_id'] = is_numeric($input['category_id']) ? (int)$input['category_id'] : $input['category_id'];
        }
        if (isset($input['supplier_id']) && $input['supplier_id'] !== '') {
            $input['supplier_id'] = is_numeric($input['supplier_id']) ? (int)$input['supplier_id'] : $input['supplier_id'];
        } else {
            unset($input['supplier_id']);
        }
        
        // Remplacer les données de la requête
        $request->merge($input);
        
        // Validation
        $rules = [
            'name' => 'sometimes|string',
            'code' => 'nullable|string',
            'category_id' => 'sometimes|exists:product_categories,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'prix_achat' => 'sometimes|numeric|min:0',
            'prix_vente' => 'sometimes|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'min_stock_alert' => 'sometimes|integer|min:0',
        ];
        
        // Ajouter la validation de l'image seulement si un fichier est présent
        if ($request->hasFile('image')) {
            $rules['image'] = 'required|image|mimes:jpeg,png,jpg,gif|max:2048';
        }
        
        $validated = $request->validate($rules);

        // Gérer la suppression de l'image
        if ($request->has('delete_image') && $request->input('delete_image') == '1') {
            if ($product->image && Storage::disk('public')->exists($product->image)) {
                Storage::disk('public')->delete($product->image);
                Log::info('Image deleted', ['path' => $product->image]);
            }
            $validated['image'] = null;
        } elseif ($request->hasFile('image')) {
            // Supprimer l'ancienne image si elle existe
            if ($product->image && Storage::disk('public')->exists($product->image)) {
                Storage::disk('public')->delete($product->image);
            }
            $imagePath = $request->file('image')->store('products', 'public');
            $validated['image'] = $imagePath;
            Log::info('Image uploaded', ['path' => $imagePath]);
        } else {
            Log::info('No image file in request');
        }

        $product->update($validated);
        $product->load(['category', 'supplier']);
        
        // Ajouter le chemin relatif de l'image
        if ($product->image) {
            $product->image_url = '/storage/' . $product->image;
            Log::info('Product image URL generated', [
                'image_path' => $product->image,
                'image_url' => $product->image_url,
            ]);
        }
        
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
