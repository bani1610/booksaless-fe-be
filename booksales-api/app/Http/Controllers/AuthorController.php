<?php

namespace App\Http\Controllers;

use App\Models\Author;
use Illuminate\Http\Request;

class AuthorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $validated = $request->validate([
            'search' => 'nullable|string|max:255',
        ]);

        $authors = Author::with('books')
            ->when($validated['search'] ?? null, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('bio', 'like', "%{$search}%");
                });
            })
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'List Data Authors',
            'data' => $authors
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'photo' => 'nullable|string',
            'bio' => 'nullable|string',
        ]);

        $author = Author::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Author Created Successfully',
            'data' => $author
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $author = Author::with('books')->find($id);

        if (!$author) {
            return response()->json([
                'success' => false,
                'message' => 'Author Not Found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail Data Author',
            'data' => $author
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $author = Author::find($id);

        if (!$author) {
            return response()->json([
                'success' => false,
                'message' => 'Author Not Found',
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'photo' => 'nullable|string',
            'bio' => 'nullable|string',
        ]);

        $author->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Author Updated Successfully',
            'data' => $author
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $author = Author::find($id);

        if (!$author) {
            return response()->json([
                'success' => false,
                'message' => 'Author Not Found',
            ], 404);
        }

        $author->delete();

        return response()->json([
            'success' => true,
            'message' => 'Author Deleted Successfully',
        ], 200);
    }
}
