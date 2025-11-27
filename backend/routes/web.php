<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;

// Routes d'authentification
Route::get('/', function () {
    return view('auth.login');
})->name('login');

Route::get('/register', function () {
    return view('auth.register');
})->name('register');

// Routes protégées
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        return view('dashboard');
    })->name('dashboard');
});

// Rediriger toutes les routes web vers le frontend Vue.js
Route::get('/{any}', function () {
    return redirect('http://localhost:5173');
})->where('any', '.*');
