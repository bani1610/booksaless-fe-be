<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\Request;

class BookController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $books = Book::with(['genre', 'author'])->get();

        return response()->json([
            'success' => true,
            'message' => 'List Data Books',
            'data' => $books
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'cover_photo' => 'nullable|string',
            'genre_id' => 'required|exists:genres,id',
            'author_id' => 'required|exists:authors,id',
        ]);

        $book = Book::create($validated);
        $book->load(['genre', 'author']);

        return response()->json([
            'success' => true,
            'message' => 'Book Created Successfully',
            'data' => $book
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $book = Book::with(['genre', 'author'])->find($id);

        if (!$book) {
            return response()->json([
                'success' => false,
                'message' => 'Book Not Found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail Data Book',
            'data' => $book
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $book = Book::find($id);

        if (!$book) {
            return response()->json([
                'success' => false,
                'message' => 'Book Not Found',
            ], 404);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'stock' => 'sometimes|required|integer|min:0',
            'cover_photo' => 'nullable|string',
            'genre_id' => 'sometimes|required|exists:genres,id',
            'author_id' => 'sometimes|required|exists:authors,id',
        ]);

        $book->update($validated);
        $book->load(['genre', 'author']);

        return response()->json([
            'success' => true,
            'message' => 'Book Updated Successfully',
            'data' => $book
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $book = Book::find($id);

        if (!$book) {
            return response()->json([
                'success' => false,
                'message' => 'Book Not Found',
            ], 404);
        }

        $book->delete();

        return response()->json([
            'success' => true,
            'message' => 'Book Deleted Successfully',
        ], 200);
    }
}
