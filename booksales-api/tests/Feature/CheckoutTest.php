<?php

namespace Tests\Feature;

use App\Models\Author;
use App\Models\Book;
use App\Models\Genre;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Tests\TestCase;

// DatabaseTransactions (bukan RefreshDatabase) agar data di database pengembangan tidak terhapus
class CheckoutTest extends TestCase
{
    use DatabaseTransactions;

    private const SECRET = 'dp_test_secret';

    private Book $book;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();
        config([
            'services.durianpay.secret_key' => self::SECRET,
            'services.durianpay.base_url' => 'https://api-sandbox.durianpay.id/v1',
            'services.durianpay.checkout_url' => 'https://checkout-sandbox.durianpay.id',
        ]);

        $genre = Genre::create(['name' => 'Uji', 'description' => 'Genre uji']);
        $author = Author::create(['name' => 'Penulis Uji', 'photo' => 'x.jpg', 'bio' => 'Bio']);
        $this->book = Book::create([
            'title' => 'Buku Uji', 'description' => 'Desc', 'price' => 50000, 'stock' => 5,
            'cover_photo' => 'x.jpg', 'genre_id' => $genre->id, 'author_id' => $author->id,
        ]);

        $customer = User::create([
            'name' => 'Customer Uji', 'email' => 'uji-' . uniqid() . '@example.com',
            'password' => Str::random(16), 'is_admin' => false,
        ]);
        $this->token = auth('api')->login($customer);
    }

    /** $payment: null = belum dibayar, 'good' = lunas dengan signature benar, 'bad' = signature salah */
    private function fakeDurianpay(?string $payment = null): void
    {
        $signature = $payment === 'good'
            ? hash_hmac('sha256', 'pay_1|100000.00', self::SECRET)
            : 'signature-palsu';

        Http::fake([
            '*/orders/ord_test123*' => Http::response(['data' => [
                'id' => 'ord_test123',
                'payments' => $payment ? [['id' => 'pay_1', 'status' => 'completed']] : [],
            ]]),
            '*/payments/pay_1/status' => Http::response(['data' => ['status' => 'completed', 'signature' => $signature]]),
            '*/orders' => Http::response(['data' => ['id' => 'ord_test123', 'payment_link_url' => 'abc123']], 201),
        ]);
    }

    private function checkout(int $quantity)
    {
        return $this->withToken($this->token)->postJson('/api/checkout', [
            'items' => [['book_id' => $this->book->id, 'quantity' => $quantity]],
        ]);
    }

    private function paymentStatus()
    {
        return $this->withToken($this->token)->getJson('/api/checkout/ord_test123/status');
    }

    public function test_checkout_reserves_stock_and_returns_payment_page(): void
    {
        $this->fakeDurianpay();

        $this->checkout(2)
            ->assertStatus(201)
            ->assertJsonPath('data.order_id', 'ord_test123')
            ->assertJsonPath('data.payment_url', 'https://checkout-sandbox.durianpay.id/payment-link/abc123')
            ->assertJsonPath('data.amount', '100000.00');

        $this->assertSame(3, $this->book->fresh()->stock);
        $this->assertDatabaseHas('transactions', [
            'book_id' => $this->book->id, 'payment_status' => 'pending', 'payment_order_id' => 'ord_test123',
        ]);
        Http::assertSent(fn ($req) => str_ends_with($req->url(), '/orders')
            && $req['amount'] === '100000.00' && $req['is_payment_link'] === true);
    }

    public function test_checkout_rejects_insufficient_stock_without_calling_durianpay(): void
    {
        $this->fakeDurianpay();

        $this->checkout(6)->assertStatus(400);

        $this->assertSame(5, $this->book->fresh()->stock);
        $this->assertSame(0, Transaction::where('book_id', $this->book->id)->count());
        Http::assertNothingSent();
    }

    public function test_status_stays_pending_until_durianpay_records_payment(): void
    {
        $this->fakeDurianpay();
        $this->checkout(2);

        $this->paymentStatus()->assertOk()->assertJsonPath('data.status', 'pending');
    }

    public function test_status_rejects_invalid_signature(): void
    {
        $this->fakeDurianpay('bad');
        $this->checkout(2);

        $this->paymentStatus()->assertStatus(402);
        $this->assertDatabaseHas('transactions', ['payment_order_id' => 'ord_test123', 'payment_status' => 'pending']);
    }

    public function test_status_marks_paid_with_valid_signature(): void
    {
        $this->fakeDurianpay('good');
        $this->checkout(2);

        $this->paymentStatus()->assertOk()->assertJsonPath('data.status', 'paid');
        $this->assertDatabaseHas('transactions', [
            'payment_order_id' => 'ord_test123', 'payment_status' => 'paid', 'payment_id' => 'pay_1',
        ]);
    }

    public function test_cancel_restores_stock_once(): void
    {
        $this->fakeDurianpay();
        $this->checkout(2);

        $this->withToken($this->token)->postJson('/api/checkout/cancel', ['order_id' => 'ord_test123'])->assertStatus(200);
        $this->assertSame(5, $this->book->fresh()->stock);
        $this->paymentStatus()->assertOk()->assertJsonPath('data.status', 'cancelled');

        // Batal kedua kali tidak boleh menambah stok lagi
        $this->withToken($this->token)->postJson('/api/checkout/cancel', ['order_id' => 'ord_test123'])->assertStatus(409);
        $this->assertSame(5, $this->book->fresh()->stock);
    }
}
