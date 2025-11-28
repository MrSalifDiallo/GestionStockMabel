<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{
    AuthController,
    ProductController,
    ProductCategorieController,
    SaleController,
    ClientController,
    ExpenseController,
    ExpenseCategorieController,
    SupplierController,
    DashboardController,
    ReportsController,
};

// Auth routes (sans auth)
//All is prefix is Api in config/cors.php
Route::post('auth/register', [AuthController::class, 'register']);
Route::post('auth/login', [AuthController::class, 'login']);

// Routes protégées
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/user', [AuthController::class, 'user']);

    // Products
    Route::apiResource('products', ProductController::class);
    Route::get('products/stock-alerts', [ProductController::class, 'stockAlerts']);
    Route::get('product-categories', [ProductCategorieController::class, 'index']);

    // Sales
    Route::apiResource('sales', SaleController::class);

    // Clients
    Route::apiResource('clients', ClientController::class);

    // Expenses
    Route::apiResource('expenses', ExpenseController::class);
    Route::get('expense-categories', [ExpenseCategorieController::class, 'index']);

    // Suppliers (Admin only)
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('suppliers', SupplierController::class);
    });

    // Users (Admin only)
    Route::middleware('role:admin')->group(function () {
        Route::get('users', [AuthController::class, 'index']);
        Route::post('users', [AuthController::class, 'store']);
        Route::put('users/{user}', [AuthController::class, 'update']);
        Route::delete('users/{user}', [AuthController::class, 'destroy']);
    });

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
    
    // Reports
    Route::get('/reports', [ReportsController::class, 'index']);
});
