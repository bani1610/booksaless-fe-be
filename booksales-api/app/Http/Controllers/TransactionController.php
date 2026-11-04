<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TransactionController extends Controller
{
    /**
     * Display a listing of the resource (admin).
     */
    public function index()
    {
        $transactions = Transaction::with(['customer', 'book.genre', 'book.author'])->get();

        return response()->json([
            'success' => true,
            'message' => 'List Data Transactions',
            'data' => $transactions
        ], 200);
    }

    /**
     * Store a newly created resource in storage (customer).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'book_id' => 'required|exists:books,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $book = Book::find($validated['book_id']);

        if ($book->stock < $validated['quantity']) {
            return response()->json([
                'success' => false,
                'message' => 'Stok buku tidak mencukupi',
            ], 400);
        }

        $transaction = DB::transaction(function () use ($validated, $book, $request) {
            $book->decrement('stock', $validated['quantity']);

            return Transaction::create([
                'order_number' => 'ORD-' . strtoupper(Str::random(8)),
                'customer_id' => $request->user()->id,
                'book_id' => $book->id,
                'quantity' => $validated['quantity'],
                'total_amount' => $book->price * $validated['quantity'],
            ]);
        });

        $transaction->load(['customer', 'book']);

        return response()->json([
            'success' => true,
            'message' => 'Transaction Created Successfully',
            'data' => $transaction
        ], 201);
    }

    /**
     * Display the specified resource (customer, own transaction only).
     */
    public function show(Request $request, string $id)
    {
        $transaction = Transaction::with(['customer', 'book.genre', 'book.author'])->find($id);

        if (!$transaction || $transaction->customer_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction Not Found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail Data Transaction',
            'data' => $transaction
        ], 200);
    }

    /**
     * Update the specified resource in storage (customer, own transaction only).
     */
    public function update(Request $request, string $id)
    {
        $transaction = Transaction::find($id);

        if (!$transaction || $transaction->customer_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction Not Found',
            ], 404);
        }

        $validated = $request->validate([
            'book_id' => 'sometimes|required|exists:books,id',
            'quantity' => 'sometimes|required|integer|min:1',
        ]);

        $oldBook = $transaction->book;
        $newBook = Book::find($validated['book_id'] ?? $transaction->book_id);
        $quantity = $validated['quantity'] ?? $transaction->quantity;

        // stok yang tersedia untuk buku baru, setelah stok lama dikembalikan
        $available = $newBook->stock + ($newBook->id === $oldBook->id ? $transaction->quantity : 0);

        if ($available < $quantity) {
            return response()->json([
                'success' => false,
                'message' => 'Stok buku tidak mencukupi',
            ], 400);
        }

        DB::transaction(function () use ($transaction, $oldBook, $newBook, $quantity) {
            $oldBook->increment('stock', $transaction->quantity);
            $newBook->refresh()->decrement('stock', $quantity);

            $transaction->update([
                'book_id' => $newBook->id,
                'quantity' => $quantity,
                'total_amount' => $newBook->price * $quantity,
            ]);
        });

        $transaction->load(['customer', 'book']);

        return response()->json([
            'success' => true,
            'message' => 'Transaction Updated Successfully',
            'data' => $transaction
        ], 200);
    }

    /**
     * Remove the specified resource from storage (admin).
     */
    public function destroy(string $id)
    {
        $transaction = Transaction::find($id);

        if (!$transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction Not Found',
            ], 404);
        }

        DB::transaction(function () use ($transaction) {
            $transaction->book()->increment('stock', $transaction->quantity);
            $transaction->delete();
        });

        return response()->json([
            'success' => true,
            'message' => 'Transaction Deleted Successfully',
        ], 200);
    }
}
