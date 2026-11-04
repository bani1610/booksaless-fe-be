<?php

namespace Tests\Feature;

use Tests\TestCase;

class ApiTest extends TestCase
{
    public function test_get_books_returns_json(): void
    {
        $response = $this->getJson('/api/books');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => ['id', 'title', 'genre', 'author']
                ]
            ]);
    }

    public function test_get_authors_returns_json(): void
    {
        $response = $this->getJson('/api/authors');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => ['id', 'name', 'bio']
                ]
            ]);
    }

    public function test_authors_can_be_filtered_by_search_term(): void
    {
        $response = $this->getJson('/api/authors?search=Tere');

        $response->assertStatus(200)
            ->assertJsonPath('data.0.name', 'Tere Liye');
    }

    public function test_author_search_term_must_be_a_string_within_the_maximum_length(): void
    {
        $response = $this->getJson('/api/authors?search=' . str_repeat('a', 256));

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['search']);
    }

    public function test_get_genres_returns_json(): void
    {
        $response = $this->getJson('/api/genres');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => ['id', 'name', 'description']
                ]
            ]);
    }
}
