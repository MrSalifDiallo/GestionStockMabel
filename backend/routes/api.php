<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\FournisseurController;

// Routes publiques
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Routes protégées
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Routes des produits
    Route::apiResource('products', ProductController::class);
    Route::get('products/stock-alerts', [ProductController::class, 'stockAlerts']);

    // Routes des transactions
    Route::apiResource('transactions', TransactionController::class);
    Route::get('transactions/stats', [TransactionController::class, 'stats']);

    // Routes des fournisseurs (Admin uniquement)
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('fournisseurs', FournisseurController::class);
    });

    // Routes de gestion des utilisateurs (Admin uniquement)
    Route::middleware('role:admin')->group(function () {
        Route::get('users', [AuthController::class, 'index']);
        Route::post('users', [AuthController::class, 'store']);
        Route::put('users/{user}', [AuthController::class, 'update']);
        Route::delete('users/{user}', [AuthController::class, 'destroy']);
    });
}); 