<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\AuthorController;
use App\Http\Controllers\GenreController;
use App\Http\Controllers\TransactionController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public: read all & show
Route::apiResources([
	'books' => BookController::class,
	'authors' => AuthorController::class,
	'genres' => GenreController::class,
], [
	'only' => ['index', 'show'],
]);

Route::middleware('auth:api')->group(function () {
	Route::post('/logout', [AuthController::class, 'logout']);

	// Customer (authenticated): create, update, show
	Route::middleware('customer')->group(function () {
		Route::apiResource('transactions', TransactionController::class)
			->only(['store', 'update', 'show']);
	});

	// Admin only
	Route::middleware('admin')->group(function () {
		Route::apiResources([
			'books' => BookController::class,
			'authors' => AuthorController::class,
			'genres' => GenreController::class,
		], [
			'except' => ['index', 'show'],
		]);

		Route::apiResource('transactions', TransactionController::class)
			->only(['index', 'destroy']);
	});
});
