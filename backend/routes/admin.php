<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\FournisseurController;

Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // Gestion des utilisateurs
    Route::get('users', [AuthController::class, 'index']);
    Route::post('users', [AuthController::class, 'store']);
    Route::put('users/{user}', [AuthController::class, 'update']);
    Route::delete('users/{user}', [AuthController::class, 'destroy']);

    // Gestion des fournisseurs
    Route::apiResource('fournisseurs', FournisseurController::class);
}); 