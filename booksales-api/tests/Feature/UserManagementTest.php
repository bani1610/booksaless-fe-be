<?php

namespace Tests\Feature;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Tests\TestCase;

// DatabaseTransactions (bukan RefreshDatabase) agar data di database pengembangan tidak terhapus
class UserManagementTest extends TestCase
{
    use DatabaseTransactions;

    private User $admin;
    // Password acak per test (bukan kredensial nyata), sekaligus menghindari temuan pemindai secret
    private string $password;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();
        $this->password = Str::random(16);
        $this->admin = $this->makeUser(true);
        $this->token = auth('api')->login($this->admin);
    }

    private function makeUser(bool $isAdmin = false): User
    {
        $suffix = substr(uniqid(), -8);
        return User::create([
            'name' => 'User ' . $suffix, 'username' => 'u' . $suffix, 'email' => "u{$suffix}@example.com",
            'password' => $this->password, 'is_admin' => $isAdmin,
        ]);
    }

    public function test_customer_cannot_access_user_management(): void
    {
        $token = auth('api')->login($this->makeUser());
        $this->withToken($token)->getJson('/api/users')->assertStatus(403);
    }

    public function test_admin_creates_user_with_hashed_password_and_hidden_in_response(): void
    {
        $newPassword = Str::random(16);
        $res = $this->withToken($this->token)->postJson('/api/users', [
            'name' => 'Akun Baru', 'username' => 'akun.baru', 'email' => 'akun.baru@example.com',
            'password' => $newPassword, 'is_admin' => true,
        ])->assertStatus(201)->assertJsonMissingPath('data.password');

        $user = User::find($res->json('data.id'));
        $this->assertTrue($user->is_admin);
        $this->assertTrue(Hash::check($newPassword, $user->password));
    }

    public function test_update_with_empty_password_keeps_old_password(): void
    {
        $user = $this->makeUser();

        $this->withToken($this->token)->putJson("/api/users/{$user->id}", [
            'name' => 'Nama Baru', 'password' => '',
        ])->assertOk()->assertJsonPath('data.name', 'Nama Baru');

        $this->assertTrue(Hash::check($this->password, $user->fresh()->password));
    }

    public function test_admin_cannot_demote_or_delete_self(): void
    {
        $this->withToken($this->token)->putJson("/api/users/{$this->admin->id}", ['is_admin' => false])->assertStatus(409);
        $this->withToken($this->token)->deleteJson("/api/users/{$this->admin->id}")->assertStatus(409);
        $this->assertTrue($this->admin->fresh()->is_admin);
    }

    public function test_user_with_transactions_cannot_be_deleted(): void
    {
        $user = $this->makeUser();
        Transaction::create([
            'order_number' => 'ORD-' . uniqid(), 'customer_id' => $user->id, 'book_id' => \App\Models\Book::query()->value('id'),
            'quantity' => 1, 'total_amount' => 1000, 'payment_status' => 'paid',
        ]);

        $this->withToken($this->token)->deleteJson("/api/users/{$user->id}")->assertStatus(409);
        $this->assertNotNull($user->fresh());
    }

    public function test_duplicate_email_is_rejected(): void
    {
        $other = $this->makeUser();

        $this->withToken($this->token)->postJson('/api/users', [
            'name' => 'Duplikat', 'username' => 'duplikat', 'email' => $other->email, 'password' => $this->password,
        ])->assertStatus(422)->assertJsonValidationErrors(['email']);
    }
}
