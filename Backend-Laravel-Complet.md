# 🚀 BACKEND LARAVEL COMPLET - MABEL PROJECT

## 📁 STRUCTURE DU PROJET LARAVEL

```
laravel-app/
├── app/
│   ├── Models/
│   │   ├── User.php
│   │   ├── Product.php
│   │   ├── ProductCategory.php
│   │   ├── Sale.php
│   │   ├── SaleItem.php
│   │   ├── Client.php
│   │   ├── Expense.php
│   │   └── ExpenseCategory.php
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AuthController.php
│   │   │   ├── ProductController.php
│   │   │   ├── SaleController.php
│   │   │   ├── ClientController.php
│   │   │   ├── ExpenseController.php
│   │   │   ├── DashboardController.php
│   │   │   └── ReportController.php
│   │   └── Requests/
│   │       ├── StoreProductRequest.php
│   │       ├── StoreSaleRequest.php
│   │       └── StoreExpenseRequest.php
│   └── Services/
│       ├── ProductService.php
│       ├── SaleService.php
│       ├── ExpenseService.php
│       └── DashboardService.php
├── database/
│   ├── migrations/
│   │   ├── create_users_table.php
│   │   ├── create_product_categories_table.php
│   │   ├── create_products_table.php
│   │   ├── create_clients_table.php
│   │   ├── create_sales_table.php
│   │   ├── create_sale_items_table.php
│   │   ├── create_expense_categories_table.php
│   │   └── create_expenses_table.php
│   ├── seeders/
│   │   ├── DatabaseSeeder.php
│   │   ├── UserSeeder.php
│   │   ├── ProductCategorySeeder.php
│   │   ├── ProductSeeder.php
│   │   ├── ClientSeeder.php
│   │   ├── ExpenseCategorySeeder.php
│   │   └── ExpenseSeeder.php
├── routes/
│   └── api.php
└── .env
```

---

## 🔧 ÉTAPE 1 : SETUP LARAVEL

```bash
# 1. Créer un nouveau projet Laravel
composer create-project laravel/laravel mabel-api

cd mabel-api

# 2. Installer les dépendances nécessaires
composer require laravel/sanctum laravel/tinker
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# 3. Configure .env
cp .env.example .env
php artisan key:generate

# Configure la DB (MySQL)
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=mabel_db
# DB_USERNAME=root
# DB_PASSWORD=
```

---

## 🔄 ÉTAPE 2 : MIGRATIONS

### 1️⃣ Users (Auth)
```php
# database/migrations/2024_01_01_000001_create_users_table.php

Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email')->unique();
    $table->timestamp('email_verified_at')->nullable();
    $table->string('password');
    $table->enum('role', ['admin', 'seller'])->default('seller');
    $table->string('phone')->nullable();
    $table->string('avatar')->nullable();
    $table->boolean('active')->default(true);
    $table->rememberToken();
    $table->timestamps();
});

Schema::create('personal_access_tokens', function (Blueprint $table) {
    $table->id();
    $table->morphs('tokenable');
    $table->string('name');
    $table->string('token', 80)->unique();
    $table->text('abilities')->nullable();
    $table->timestamp('last_used_at')->nullable();
    $table->timestamp('expires_at')->nullable();
    $table->timestamps();
});
```

### 2️⃣ Product Categories
```php
# database/migrations/2024_01_01_000002_create_product_categories_table.php

Schema::create('product_categories', function (Blueprint $table) {
    $table->id();
    $table->string('name')->unique(); // Robes, Boubous, Tuniques, etc.
    $table->text('description')->nullable();
    $table->string('icon')->nullable();
    $table->boolean('active')->default(true);
    $table->timestamps();
});
```

### 3️⃣ Products
```php
# database/migrations/2024_01_01_000003_create_products_table.php

Schema::create('products', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('code')->unique()->nullable(); // B_30, R_ANK_01
    $table->text('description')->nullable();
    $table->foreignId('category_id')->constrained('product_categories');
    $table->decimal('price', 12, 2); // Prix de vente
    $table->decimal('cost', 12, 2);  // Prix d'achat
    $table->integer('stock')->default(0);
    $table->integer('min_stock_alert')->default(5); // Seuil d'alerte
    $table->string('image')->nullable();
    $table->boolean('active')->default(true);
    $table->timestamps();
    
    $table->index('category_id');
});
```

### 4️⃣ Clients
```php
# database/migrations/2024_01_01_000004_create_clients_table.php

Schema::create('clients', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('phone')->nullable();
    $table->string('email')->nullable();
    $table->string('address')->nullable();
    $table->text('measurements')->nullable(); // Notes tailles/mesures
    $table->decimal('total_purchased', 12, 2)->default(0);
    $table->decimal('total_paid', 12, 2)->default(0);
    $table->decimal('total_due', 12, 2)->default(0); // Créance
    $table->date('last_purchase')->nullable();
    $table->boolean('active')->default(true);
    $table->timestamps();
});
```

### 5️⃣ Sales
```php
# database/migrations/2024_01_01_000005_create_sales_table.php

Schema::create('sales', function (Blueprint $table) {
    $table->id();
    $table->string('invoice_number')->unique(); // 250127-0001
    $table->foreignId('seller_id')->constrained('users');
    $table->foreignId('client_id')->nullable()->constrained('clients');
    $table->string('client_name')->nullable(); // Client ponctuel
    $table->date('sale_date');
    $table->decimal('subtotal', 12, 2);
    $table->decimal('discount_amount', 12, 2)->default(0);
    $table->decimal('total', 12, 2);
    $table->decimal('amount_paid', 12, 2)->default(0);
    $table->decimal('amount_due', 12, 2)->default(0);
    $table->enum('payment_status', ['paid', 'partial', 'pending'])->default('pending');
    $table->text('notes')->nullable();
    $table->timestamps();
    
    $table->index(['sale_date', 'seller_id']);
});
```

### 6️⃣ Sale Items
```php
# database/migrations/2024_01_01_000006_create_sale_items_table.php

Schema::create('sale_items', function (Blueprint $table) {
    $table->id();
    $table->foreignId('sale_id')->constrained('sales')->onDelete('cascade');
    $table->foreignId('product_id')->constrained('products');
    $table->integer('quantity');
    $table->decimal('unit_price', 12, 2);
    $table->decimal('discount_percent', 5, 2)->default(0);
    $table->decimal('line_total', 12, 2);
    $table->timestamps();
});
```

### 7️⃣ Expense Categories
```php
# database/migrations/2024_01_01_000007_create_expense_categories_table.php

Schema::create('expense_categories', function (Blueprint $table) {
    $table->id();
    $table->string('name')->unique(); // Mercerie, Transport, Électricité, etc.
    $table->text('description')->nullable();
    $table->enum('type', ['fixed', 'variable'])->default('variable');
    $table->string('icon')->nullable();
    $table->boolean('active')->default(true);
    $table->timestamps();
});
```

### 8️⃣ Expenses
```php
# database/migrations/2024_01_01_000008_create_expenses_table.php

Schema::create('expenses', function (Blueprint $table) {
    $table->id();
    $table->foreignId('category_id')->constrained('expense_categories');
    $table->date('expense_date');
    $table->decimal('amount', 12, 2);
    $table->string('description')->nullable();
    $table->string('reference')->nullable(); // N° facture
    $table->string('receipt')->nullable(); // Fichier joint
    $table->foreignId('created_by')->constrained('users');
    $table->timestamps();
    
    $table->index(['expense_date', 'category_id']);
});
```

**Lancer les migrations :**
```bash
php artisan migrate
php artisan migrate:refresh --seed
```

---

## 📋 ÉTAPE 3 : MODÈLES

### User Model
```php
# app/Models/User.php

<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'role', 'phone', 'avatar', 'active'
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function sales()
    {
        return $this->hasMany(Sale::class, 'seller_id');
    }

    public function expenses()
    {
        return $this->hasMany(Expense::class, 'created_by');
    }

    public function isAdmin()
    {
        return $this->role === 'admin';
    }
}
```

### Product Model
```php
# app/Models/Product.php

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name', 'code', 'description', 'category_id',
        'price', 'cost', 'stock', 'min_stock_alert', 'image', 'active'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'cost' => 'decimal:2',
    ];

    public function category()
    {
        return $this->belongsTo(ProductCategory::class);
    }

    public function saleItems()
    {
        return $this->hasMany(SaleItem::class);
    }

    // Calculer la marge
    public function getMarginAttribute()
    {
        if ($this->cost == 0) return 0;
        return round((($this->price - $this->cost) / $this->cost) * 100, 2);
    }

    // Statut du stock
    public function getStockStatusAttribute()
    {
        if ($this->stock <= 0) return 'danger';
        if ($this->stock <= $this->min_stock_alert) return 'warning';
        return 'ok';
    }
}
```

### Client Model
```php
# app/Models/Client.php

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    protected $fillable = [
        'name', 'phone', 'email', 'address', 
        'measurements', 'active'
    ];

    public function sales()
    {
        return $this->hasMany(Sale::class);
    }

    // Calculer la créance
    public function getTotalDueAttribute()
    {
        return $this->sales()->sum('amount_due');
    }

    // Calculer total commandé
    public function getTotalPurchasedAttribute()
    {
        return $this->sales()->sum('total');
    }

    // Calculer total payé
    public function getTotalPaidAttribute()
    {
        return $this->sales()->sum('amount_paid');
    }
}
```

### Sale Model
```php
# app/Models/Sale.php

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    protected $fillable = [
        'invoice_number', 'seller_id', 'client_id', 'client_name',
        'sale_date', 'subtotal', 'discount_amount', 'total',
        'amount_paid', 'amount_due', 'payment_status', 'notes'
    ];

    protected $casts = [
        'sale_date' => 'date',
        'subtotal' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'amount_due' => 'decimal:2',
    ];

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function items()
    {
        return $this->hasMany(SaleItem::class);
    }

    // Générer numéro facture automatique
    public static function generateInvoiceNumber()
    {
        $date = now()->format('ymd');
        $count = self::whereDate('created_at', today())->count() + 1;
        return $date . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
    }
}
```

### SaleItem Model
```php
# app/Models/SaleItem.php

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SaleItem extends Model
{
    protected $fillable = [
        'sale_id', 'product_id', 'quantity',
        'unit_price', 'discount_percent', 'line_total'
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'discount_percent' => 'decimal:2',
        'line_total' => 'decimal:2',
    ];

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
```

### Expense Model
```php
# app/Models/Expense.php

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    protected $fillable = [
        'category_id', 'expense_date', 'amount',
        'description', 'reference', 'receipt', 'created_by'
    ];

    protected $casts = [
        'expense_date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function category()
    {
        return $this->belongsTo(ExpenseCategory::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
```

---

## 🎮 ÉTAPE 4 : CONTRÔLEURS

### AuthController
```php
# app/Http/Controllers/AuthController.php

<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response(['message' => 'Invalid credentials'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response(['message' => 'Logout successful']);
    }

    public function user(Request $request)
    {
        return response($request->user());
    }
}
```

### ProductController
```php
# app/Http/Controllers/ProductController.php

<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    // GET /api/products
    public function index(Request $request)
    {
        $query = Product::with('category');

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

        return response($query->get());
    }

    // GET /api/products/{id}
    public function show(Product $product)
    {
        return response($product->load('category'));
    }

    // POST /api/products
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'code' => 'nullable|unique:products',
            'category_id' => 'required|exists:product_categories,id',
            'price' => 'required|numeric|min:0',
            'cost' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'min_stock_alert' => 'integer|min:0',
        ]);

        $product = Product::create($validated);
        return response($product, 201);
    }

    // PUT /api/products/{id}
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'string',
            'price' => 'numeric|min:0',
            'cost' => 'numeric|min:0',
            'stock' => 'integer|min:0',
            'min_stock_alert' => 'integer|min:0',
        ]);

        $product->update($validated);
        return response($product);
    }

    // DELETE /api/products/{id}
    public function destroy(Product $product)
    {
        $product->delete();
        return response(['message' => 'Product deleted']);
    }
}
```

### SaleController
```php
# app/Http/Controllers/SaleController.php

<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Product;
use App\Models\Client;
use Illuminate\Http\Request;

class SaleController extends Controller
{
    // GET /api/sales
    public function index(Request $request)
    {
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

        return response($query->latest()->paginate(20));
    }

    // GET /api/sales/{id}
    public function show(Sale $sale)
    {
        return response($sale->load(['seller', 'client', 'items.product']));
    }

    // POST /api/sales
    public function store(Request $request)
    {
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

        // Calculer les totaux
        $subtotal = 0;
        $totalItems = 0;

        foreach ($validated['items'] as $item) {
            $lineTotal = $item['quantity'] * $item['unit_price'];
            $discount = ($lineTotal * ($item['discount_percent'] ?? 0)) / 100;
            $subtotal += $lineTotal - $discount;
            $totalItems += $item['quantity'];
        }

        // Remise automatique
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

        // Créer la vente
        $sale = Sale::create([
            'invoice_number' => Sale::generateInvoiceNumber(),
            'seller_id' => auth()->id(),
            'client_id' => $validated['client_id'],
            'client_name' => $validated['client_name'],
            'sale_date' => now(),
            'subtotal' => $subtotal,
            'discount_amount' => $autoDiscount,
            'total' => $total,
            'amount_paid' => $validated['amount_paid'],
            'amount_due' => $amountDue,
            'payment_status' => $paymentStatus,
            'notes' => $validated['notes'],
        ]);

        // Créer les articles
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

            // Décrémenter le stock
            $product = Product::find($item['product_id']);
            $product->decrement('stock', $item['quantity']);
        }

        return response($sale->load(['items.product']), 201);
    }

    // DELETE /api/sales/{id}
    public function destroy(Sale $sale)
    {
        $sale->delete();
        return response(['message' => 'Sale deleted']);
    }
}
```

### ClientController
```php
# app/Http/Controllers/ClientController.php

<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    // GET /api/clients
    public function index(Request $request)
    {
        $query = Client::query();

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('phone', 'like', '%' . $request->search . '%');
        }

        if ($request->has('has_due')) {
            $query->whereRaw('(SELECT SUM(amount_due) FROM sales WHERE client_id = clients.id) > 0');
        }

        return response($query->get());
    }

    // GET /api/clients/{id}
    public function show(Client $client)
    {
        return response($client->load('sales'));
    }

    // POST /api/clients
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email|unique:clients',
            'address' => 'nullable|string',
            'measurements' => 'nullable|string',
        ]);

        $client = Client::create($validated);
        return response($client, 201);
    }

    // PUT /api/clients/{id}
    public function update(Request $request, Client $client)
    {
        $validated = $request->validate([
            'name' => 'string',
            'phone' => 'string',
            'address' => 'string',
            'measurements' => 'string',
        ]);

        $client->update($validated);
        return response($client);
    }

    // DELETE /api/clients/{id}
    public function destroy(Client $client)
    {
        $client->delete();
        return response(['message' => 'Client deleted']);
    }
}
```

### ExpenseController
```php
# app/Http/Controllers/ExpenseController.php

<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    // GET /api/expenses
    public function index(Request $request)
    {
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

        return response($query->latest('expense_date')->paginate(20));
    }

    // POST /api/expenses
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:expense_categories,id',
            'amount' => 'required|numeric|min:0',
            'expense_date' => 'required|date',
            'description' => 'nullable|string',
            'reference' => 'nullable|string',
        ]);

        $expense = Expense::create([
            ...$validated,
            'created_by' => auth()->id(),
        ]);

        return response($expense->load('category'), 201);
    }

    // PUT /api/expenses/{id}
    public function update(Request $request, Expense $expense)
    {
        $validated = $request->validate([
            'amount' => 'numeric|min:0',
            'description' => 'string',
        ]);

        $expense->update($validated);
        return response($expense);
    }

    // DELETE /api/expenses/{id}
    public function destroy(Expense $expense)
    {
        $expense->delete();
        return response(['message' => 'Expense deleted']);
    }
}
```

### DashboardController
```php
# app/Http/Controllers/DashboardController.php

<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\Expense;
use App\Models\Product;
use App\Models\Client;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();
        $thisMonth = now()->startOfMonth();

        // Stats du jour
        $salesToday = Sale::whereDate('sale_date', $today)
            ->sum('total');

        $expensesToday = Expense::whereDate('expense_date', $today)
            ->sum('amount');

        $benefitToday = $salesToday - $expensesToday;

        // Stats du mois
        $salesMonth = Sale::where('sale_date', '>=', $thisMonth)
            ->sum('total');

        $expensesMonth = Expense::where('expense_date', '>=', $thisMonth)
            ->sum('amount');

        $benefitMonth = $salesMonth - $expensesMonth;

        // Stock critique
        $criticalStock = Product::whereRaw('stock <= min_stock_alert')->count();

        // Créances
        $totalDue = Sale::sum('amount_due');

        // Top produits
        $topProducts = \DB::table('sale_items')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->select('products.name', \DB::raw('SUM(sale_items.quantity) as total_sold'))
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get();

        // Ventes par jour (7 derniers jours)
        $salesByDay = \DB::table('sales')
            ->select(
                \DB::raw('DATE(sale_date) as date'),
                \DB::raw('SUM(total) as total')
            )
            ->where('sale_date', '>=', now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Dépenses par catégorie
        $expensesByCategory = \DB::table('expenses')
            ->join('expense_categories', 'expenses.category_id', '=', 'expense_categories.id')
            ->select(
                'expense_categories.name',
                \DB::raw('SUM(expenses.amount) as total')
            )
            ->where('expenses.expense_date', '>=', $thisMonth)
            ->groupBy('expense_categories.id', 'expense_categories.name')
            ->orderByDesc('total')
            ->get();

        // Créances par client
        $dueClients = Client::with('sales')
            ->whereHas('sales', function ($q) {
                $q->where('amount_due', '>', 0);
            })
            ->get()
            ->map(fn($client) => [
                'name' => $client->name,
                'total_due' => $client->sales->sum('amount_due'),
                'days_overdue' => $client->sales->where('amount_due', '>', 0)
                    ->min(fn($sale) => now()->diffInDays($sale->sale_date)),
            ])
            ->sortByDesc('total_due')
            ->values();

        return response([
            'stats' => [
                'sales_today' => $salesToday,
                'expenses_today' => $expensesToday,
                'benefit_today' => $benefitToday,
                'sales_month' => $salesMonth,
                'expenses_month' => $expensesMonth,
                'benefit_month' => $benefitMonth,
                'critical_stock' => $criticalStock,
                'total_due' => $totalDue,
            ],
            'top_products' => $topProducts,
            'sales_by_day' => $salesByDay,
            'expenses_by_category' => $expensesByCategory,
            'due_clients' => $dueClients,
        ]);
    }
}
```

---

## 🛣️ ÉTAPE 5 : ROUTES API

```php
# routes/api.php

<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{
    AuthController,
    ProductController,
    SaleController,
    ClientController,
    ExpenseController,
    DashboardController,
};

// Auth routes (sans authentification)
Route::post('/auth/login', [AuthController::class, 'login']);

// Routes protégées
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/user', [AuthController::class, 'user']);

    // Products
    Route::apiResource('products', ProductController::class);

    // Sales
    Route::apiResource('sales', SaleController::class);

    // Clients
    Route::apiResource('clients', ClientController::class);

    // Expenses
    Route::apiResource('expenses', ExpenseController::class);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
});
```

---

## 🌱 ÉTAPE 6 : SEEDERS

### UserSeeder
```php
# database/seeders/UserSeeder.php

<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        User::create([
            'name' => 'Mabel Admin',
            'email' => 'admin@mabel.sn',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'phone' => '+221 77 123 4567',
        ]);

        User::create([
            'name' => 'Fatoumata Vendeur',
            'email' => 'fatou@mabel.sn',
            'password' => Hash::make('password123'),
            'role' => 'seller',
            'phone' => '+221 78 234 5678',
        ]);

        User::create([
            'name' => 'Aminata Vendeur',
            'email' => 'aminata@mabel.sn',
            'password' => Hash::make('password123'),
            'role' => 'seller',
            'phone' => '+221 79 345 6789',
        ]);
    }
}
```

### ProductCategorySeeder
```php
# database/seeders/ProductCategorySeeder.php

<?php

namespace Database\Seeders;

use App\Models\ProductCategory;
use Illuminate\Database\Seeder;

class ProductCategorySeeder extends Seeder
{
    public function run()
    {
        $categories = [
            ['name' => 'Robes', 'icon' => '👗'],
            ['name' => 'Boubous', 'icon' => '👘'],
            ['name' => 'Tuniques', 'icon' => '👚'],
            ['name' => 'Chemises', 'icon' => '👔'],
            ['name' => 'Accessoires', 'icon' => '👜'],
        ];

        foreach ($categories as $cat) {
            ProductCategory::create($cat);
        }
    }
}
```

### ProductSeeder
```php
# database/seeders/ProductSeeder.php

<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run()
    {
        $robes = ProductCategory::where('name', 'Robes')->first();
        $boubous = ProductCategory::where('name', 'Boubous')->first();
        $tuniques = ProductCategory::where('name', 'Tuniques')->first();
        $chemises = ProductCategory::where('name', 'Chemises')->first();
        $accessories = ProductCategory::where('name', 'Accessoires')->first();

        $products = [
            // Robes
            ['name' => 'Robe Ankara', 'code' => 'R_ANK_01', 'category_id' => $robes->id, 'price' => 85000, 'cost' => 55000, 'stock' => 12],
            ['name' => 'Robe Dentelle', 'code' => 'R_DEN_01', 'category_id' => $robes->id, 'price' => 95000, 'cost' => 60000, 'stock' => 8],

            // Boubous
            ['name' => 'Boubou Bazin', 'code' => 'B_BAZ_01', 'category_id' => $boubous->id, 'price' => 120000, 'cost' => 80000, 'stock' => 8],
            ['name' => 'Boubou Wax', 'code' => 'B_WAX_01', 'category_id' => $boubous->id, 'price' => 110000, 'cost' => 75000, 'stock' => 5],

            // Tuniques
            ['name' => 'Tunique Wax', 'code' => 'T_WAX_01', 'category_id' => $tuniques->id, 'price' => 65000, 'cost' => 40000, 'stock' => 3],
            ['name' => 'Tunique Ankara', 'code' => 'T_ANK_01', 'category_id' => $tuniques->id, 'price' => 60000, 'cost' => 38000, 'stock' => 10],

            // Chemises
            ['name' => 'Chemise Homme', 'code' => 'C_HOM_01', 'category_id' => $chemises->id, 'price' => 35000, 'cost' => 22000, 'stock' => 0],
            ['name' => 'Chemise Femme', 'code' => 'C_FEM_01', 'category_id' => $chemises->id, 'price' => 40000, 'cost' => 25000, 'stock' => 15],

            // Accessoires
            ['name' => 'Accessoires Mix', 'code' => 'A_MIX_01', 'category_id' => $accessories->id, 'price' => 15000, 'cost' => 8000, 'stock' => 25],
            ['name' => 'Sac à Main', 'code' => 'A_SAC_01', 'category_id' => $accessories->id, 'price' => 50000, 'cost' => 30000, 'stock' => 7],
        ];

        foreach ($products as $prod) {
            Product::create([...$prod, 'min_stock_alert' => 5]);
        }
    }
}
```

### ExpenseCategorySeeder
```php
# database/seeders/ExpenseCategorySeeder.php

<?php

namespace Database\Seeders;

use App\Models\ExpenseCategory;
use Illuminate\Database\Seeder;

class ExpenseCategorySeeder extends Seeder
{
    public function run()
    {
        $categories = [
            ['name' => 'Mercerie', 'type' => 'variable'],
            ['name' => 'Transport', 'type' => 'variable'],
            ['name' => 'Électricité', 'type' => 'fixed'],
            ['name' => 'Eau', 'type' => 'fixed'],
            ['name' => 'Tontine', 'type' => 'fixed'],
            ['name' => 'Salaires', 'type' => 'fixed'],
            ['name' => 'Loyer', 'type' => 'fixed'],
            ['name' => 'Marketing', 'type' => 'variable'],
            ['name' => 'Maintenance', 'type' => 'variable'],
            ['name' => 'Divers', 'type' => 'variable'],
        ];

        foreach ($categories as $cat) {
            ExpenseCategory::create($cat);
        }
    }
}
```

### DatabaseSeeder
```php
# database/seeders/DatabaseSeeder.php

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $this->call([
            UserSeeder::class,
            ProductCategorySeeder::class,
            ProductSeeder::class,
            ExpenseCategorySeeder::class,
        ]);
    }
}
```

**Exécuter les seeders :**
```bash
php artisan db:seed
```

---

## 📁 ÉTAPE 7 : SERVICES API (À mettre dans ton React)

Crée ce dossier dans ton frontend React :

```bash
mkdir -p src/services
```

### API Client
```typescript
# src/services/api.ts

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ajouter le token à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Auth Service
```typescript
# src/services/authService.ts

import api from './api';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },

  logout: async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => !!localStorage.getItem('auth_token'),
};
```

### Product Service
```typescript
# src/services/productService.ts

import api from './api';

export const productService = {
  getAll: async (filters?: any) => {
    const response = await api.get('/products', { params: filters });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/products', data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/products/${id}`);
  },
};
```

### Sales Service
```typescript
# src/services/salesService.ts

import api from './api';

export const salesService = {
  getAll: async (filters?: any) => {
    const response = await api.get('/sales', { params: filters });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/sales', data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/sales/${id}`);
  },
};
```

### Client Service
```typescript
# src/services/clientService.ts

import api from './api';

export const clientService = {
  getAll: async (filters?: any) => {
    const response = await api.get('/clients', { params: filters });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/clients', data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.put(`/clients/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/clients/${id}`);
  },
};
```

### Expense Service
```typescript
# src/services/expenseService.ts

import api from './api';

export const expenseService = {
  getAll: async (filters?: any) => {
    const response = await api.get('/expenses', { params: filters });
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/expenses', data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/expenses/${id}`);
  },
};
```

### Dashboard Service
```typescript
# src/services/dashboardService.ts

import api from './api';

export const dashboardService = {
  getStats: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  },
};
```

---

## 🚀 LANCER LE PROJET

**Terminal 1 (Backend Laravel) :**
```bash
cd mabel-api
php artisan migrate:refresh --seed
php artisan serve
```

**Terminal 2 (Frontend React) :**
```bash
cd mabel-frontend
npm install
npm run dev
```

**URL Frontend** : `http://localhost:5173`
**URL Backend** : `http://localhost:8000`
**API** : `http://localhost:8000/api`

---

## ✅ TEST D'AUTHENTIFICATION

```bash
# Login avec :
Email: admin@mabel.sn
Password: password123

# Ou :
Email: fatou@mabel.sn
Password: password123
```

---

**C'est complet ! À toi de jouer ! 🚀**