<?php

namespace Tests\Feature;

use App\Models\Author;
use App\Models\Genre;
use App\Models\User;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

// DatabaseTransactions (bukan RefreshDatabase) agar data di database pengembangan tidak terhapus
class PhotoUploadTest extends TestCase
{
    use DatabaseTransactions;

    private string $token;
    private FilesystemAdapter $disk;

    protected function setUp(): void
    {
        parent::setUp();
        $this->disk = Storage::fake('public');

        $admin = User::create([
            'name' => 'Admin Uji', 'email' => 'admin-' . uniqid() . '@example.com',
            'password' => Str::random(16), 'is_admin' => true,
        ]);
        $this->token = JWTAuth::fromUser($admin);
    }

    public function test_author_photo_is_optional(): void
    {
        $this->withToken($this->token)
            ->postJson('/api/authors', ['name' => 'Tanpa Foto', 'bio' => 'Bio singkat'])
            ->assertStatus(201)
            ->assertJsonPath('data.photo', null);
    }

    public function test_author_photo_can_be_uploaded(): void
    {
        $res = $this->withToken($this->token)->post('/api/authors', [
            'name' => 'Dengan Foto',
            'bio' => 'Bio',
            'photo_file' => UploadedFile::fake()->image('foto.jpg', 200, 200),
        ], ['Accept' => 'application/json'])->assertStatus(201);

        $url = $res->json('data.photo');
        $this->assertStringStartsWith('http://localhost/storage/authors/', $url);
        $this->disk->assertExists(str_replace('http://localhost/storage/', '', $url));
    }

    public function test_book_cover_upload_replaces_url_on_update_via_method_spoofing(): void
    {
        $genre = Genre::create(['name' => 'Uji', 'description' => 'Genre uji']);
        $author = Author::create(['name' => 'Penulis', 'bio' => 'Bio']);
        $bookId = $this->withToken($this->token)->postJson('/api/books', [
            'title' => 'Buku', 'price' => 10000, 'stock' => 1,
            'cover_photo' => 'https://contoh.id/lama.jpg',
            'genre_id' => $genre->id, 'author_id' => $author->id,
        ])->assertStatus(201)->json('data.id');

        // Form multipart tidak bisa memakai PUT di PHP, jadi frontend mengirim POST + _method=PUT
        $url = $this->withToken($this->token)->post("/api/books/{$bookId}", [
            '_method' => 'PUT',
            'cover_photo_file' => UploadedFile::fake()->image('sampul.png', 300, 450),
        ], ['Accept' => 'application/json'])->assertOk()->json('data.cover_photo');

        $this->assertStringStartsWith('http://localhost/storage/covers/', $url);
    }

    public function test_non_image_upload_is_rejected(): void
    {
        $this->withToken($this->token)->post('/api/authors', [
            'name' => 'Salah File',
            'photo_file' => UploadedFile::fake()->create('virus.pdf', 10, 'application/pdf'),
        ], ['Accept' => 'application/json'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['photo_file']);
    }
}
