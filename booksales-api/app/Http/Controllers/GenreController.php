<?php

namespace App\Http\Controllers;

use App\Models\Genre;
use Illuminate\Http\Request;

class GenreController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $genres = Genre::with('books')->get();

        return response()->json([
            'success' => true,
            'message' => 'List Data Genres',
            'data' => $genres
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $genre = Genre::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Genre Created Successfully',
            'data' => $genre
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $genre = Genre::with('books')->find($id);

        if (!$genre) {
            return response()->json([
                'success' => false,
                'message' => 'Genre Not Found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail Data Genre',
            'data' => $genre
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $genre = Genre::find($id);

        if (!$genre) {
            return response()->json([
                'success' => false,
                'message' => 'Genre Not Found',
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $genre->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Genre Updated Successfully',
            'data' => $genre
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $genre = Genre::find($id);

        if (!$genre) {
            return response()->json([
                'success' => false,
                'message' => 'Genre Not Found',
            ], 404);
        }

        $genre->delete();

        return response()->json([
            'success' => true,
            'message' => 'Genre Deleted Successfully',
        ], 200);
    }
}
