<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Klien kecil untuk REST API Durianpay (https://docs.durianpay.id).
 * Autentikasi: Basic Auth dengan secret key sebagai username dan password kosong.
 */
class Durianpay
{
    public function __construct(
        private ?string $secretKey = null,
        private ?string $baseUrl = null,
    ) {
        $this->secretKey ??= config('services.durianpay.secret_key');
        $this->baseUrl ??= rtrim(config('services.durianpay.base_url'), '/');
    }

    public function isConfigured(): bool
    {
        return filled($this->secretKey);
    }

    /** Membuat order; hasilnya berisi id (ord_...) dan access_token untuk membuka modal checkout. */
    public function createOrder(array $payload): array
    {
        return $this->request('post', '/orders', $payload);
    }

    /** Detail order beserta daftar pembayarannya. */
    public function getOrder(string $orderId): array
    {
        return $this->request('get', '/orders/' . urlencode($orderId), ['expand' => 'payments']);
    }

    /** URL halaman pembayaran hosted; API mengembalikan kode pendek, misalnya "rdZ20y". */
    public function paymentUrl(string $linkCode): string
    {
        if (str_starts_with($linkCode, 'http')) {
            return $linkCode;
        }
        return rtrim(config('services.durianpay.checkout_url'), '/') . '/payment-link/' . $linkCode;
    }

    /** Status pembayaran; berisi signature bila pembayaran sudah completed. */
    public function paymentStatus(string $paymentId): array
    {
        return $this->request('get', '/payments/' . urlencode($paymentId) . '/status');
    }

    /** Signature resmi Durianpay: HMAC-SHA256 dari "payment_id|amount" (amount format "15000.00"). */
    public function signature(string $paymentId, string $amount): string
    {
        return hash_hmac('sha256', $paymentId . '|' . $amount, $this->secretKey);
    }

    public static function amount(float|string $value): string
    {
        return number_format((float) $value, 2, '.', '');
    }

    private function request(string $method, string $path, array $payload = []): array
    {
        if (!$this->isConfigured()) {
            throw new RuntimeException('DURIANPAY_SECRET_KEY belum diisi di file .env');
        }

        try {
            $response = Http::withBasicAuth($this->secretKey, '')
                ->acceptJson()
                ->timeout(20)
                ->{$method}($this->baseUrl . $path, $payload);
        } catch (ConnectionException $e) {
            throw new RuntimeException('Server Durianpay tidak dapat dihubungi.', 0, $e);
        }

        if ($response->failed()) {
            $message = $response->json('error') ?? $response->json('message') ?? $response->body();
            throw new RuntimeException('Durianpay: ' . (is_string($message) ? $message : json_encode($message)));
        }

        // Respons Durianpay dibungkus dalam "data"
        return $response->json('data') ?? $response->json() ?? [];
    }
}
