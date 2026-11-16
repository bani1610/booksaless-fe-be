<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Transaction;
use App\Services\Durianpay;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Alur pembayaran keranjang dengan Durianpay (halaman bayar hosted di dalam modal):
 * 1. store  : kunci stok, buat transaksi "pending", buat order Durianpay -> kirim URL halaman bayar
 * 2. status : dipanggil berkala oleh frontend; bila Durianpay mencatat pembayaran completed,
 *             signature-nya dicocokkan lalu transaksi menjadi "paid"
 * 3. cancel : modal ditutup sebelum lunas -> "cancelled" dan stok dikembalikan
 */
class CheckoutController extends Controller
{
    public function __construct(private Durianpay $durianpay)
    {
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.book_id' => 'required|integer|distinct|exists:books,id',
            'items.*.quantity' => 'required|integer|min:1',
        ], [
            'items.required' => 'Keranjang masih kosong.',
            'items.*.book_id.distinct' => 'Buku yang sama muncul dua kali di keranjang.',
        ]);

        if (!$this->durianpay->isConfigured()) {
            return response()->json([
                'success' => false,
                'message' => 'Pembayaran online belum dikonfigurasi (DURIANPAY_SECRET_KEY kosong).',
            ], 503);
        }

        $user = $request->user();

        try {
            // Order Durianpay dibuat di dalam DB transaction: jika API gagal, stok dan transaksi ikut dibatalkan
            $result = DB::transaction(function () use ($validated, $user) {
                $books = Book::whereIn('id', array_column($validated['items'], 'book_id'))
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('id');

                $rows = [];
                $total = 0;
                foreach ($validated['items'] as $item) {
                    $book = $books[$item['book_id']];
                    if ($book->stock < $item['quantity']) {
                        throw new RuntimeException("Stok \"{$book->title}\" tinggal {$book->stock}.", 400);
                    }
                    $book->decrement('stock', $item['quantity']);
                    $subtotal = $book->price * $item['quantity'];
                    $total += $subtotal;

                    $rows[] = Transaction::create([
                        'order_number' => 'ORD-' . strtoupper(Str::random(8)),
                        'customer_id' => $user->id,
                        'book_id' => $book->id,
                        'quantity' => $item['quantity'],
                        'total_amount' => $subtotal,
                        'payment_status' => 'pending',
                    ]);
                }

                $order = $this->durianpay->createOrder([
                    'amount' => Durianpay::amount($total),
                    'currency' => 'IDR',
                    'order_ref_id' => 'CHK-' . strtoupper(Str::random(10)),
                    'is_payment_link' => true,
                    'customer' => [
                        'customer_ref_id' => 'user-' . $user->id,
                        'given_name' => $user->name,
                        'email' => $user->email,
                    ],
                    'items' => array_map(fn ($t) => [
                        'name' => $books[$t->book_id]->title,
                        'qty' => $t->quantity,
                        'price' => Durianpay::amount($books[$t->book_id]->price),
                    ], $rows),
                ]);

                if (empty($order['id']) || empty($order['payment_link_url'])) {
                    throw new RuntimeException('Durianpay tidak mengembalikan halaman pembayaran.');
                }

                Transaction::whereIn('id', array_map(fn ($t) => $t->id, $rows))
                    ->update(['payment_order_id' => $order['id']]);

                return ['order' => $order, 'total' => $total];
            });
        } catch (RuntimeException $e) {
            $status = $e->getCode() === 400 ? 400 : 502;
            return response()->json(['success' => false, 'message' => $e->getMessage()], $status);
        }

        return response()->json([
            'success' => true,
            'message' => 'Checkout dibuat, lanjutkan pembayaran',
            'data' => [
                'order_id' => $result['order']['id'],
                'payment_url' => $this->durianpay->paymentUrl($result['order']['payment_link_url']),
                'amount' => Durianpay::amount($result['total']),
            ],
        ], 201);
    }

    /** Status pembayaran satu checkout: pending | paid | cancelled. */
    public function status(Request $request, string $orderId)
    {
        $transactions = $this->ownTransactions($request, $orderId);
        if ($transactions->isEmpty()) {
            return response()->json(['success' => false, 'message' => 'Pesanan tidak ditemukan.'], 404);
        }

        $current = $transactions->first()->payment_status;
        if ($current !== 'pending') {
            return $this->statusResponse($current);
        }

        try {
            $order = $this->durianpay->getOrder($orderId);
            $payment = collect($order['payments'] ?? [])->firstWhere('status', 'completed');
            if (!$payment) {
                return $this->statusResponse('pending');
            }

            $status = $this->durianpay->paymentStatus($payment['id']);
        } catch (RuntimeException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 502);
        }

        // Signature dihitung dari total di database kita, bukan dari data dari luar
        $amount = Durianpay::amount($transactions->sum('total_amount'));
        $signature = $status['signature'] ?? '';
        if (!is_string($signature) || !hash_equals($this->durianpay->signature($payment['id'], $amount), $signature)) {
            return response()->json([
                'success' => false,
                'message' => 'Pembayaran ditemukan tetapi signature tidak cocok.',
            ], 402);
        }

        Transaction::whereIn('id', $transactions->pluck('id'))
            ->where('payment_status', 'pending')
            ->update([
                'payment_status' => 'paid',
                'payment_id' => $payment['id'],
                'paid_at' => now(),
            ]);

        return $this->statusResponse('paid');
    }

    public function cancel(Request $request)
    {
        $validated = $request->validate(['order_id' => 'required|string']);

        $pending = $this->ownTransactions($request, $validated['order_id'])
            ->where('payment_status', 'pending');

        if ($pending->isEmpty()) {
            return response()->json(['success' => false, 'message' => 'Tidak ada pembayaran yang bisa dibatalkan.'], 409);
        }

        DB::transaction(function () use ($pending) {
            foreach ($pending as $t) {
                $t->book()->increment('stock', $t->quantity);
                $t->update(['payment_status' => 'cancelled']);
            }
        });

        return response()->json(['success' => true, 'message' => 'Pembayaran dibatalkan, stok dikembalikan'], 200);
    }

    private function statusResponse(string $status)
    {
        return response()->json(['success' => true, 'message' => 'Status pembayaran', 'data' => ['status' => $status]], 200);
    }

    private function ownTransactions(Request $request, string $orderId)
    {
        return Transaction::with('book')
            ->where('customer_id', $request->user()->id)
            ->where('payment_order_id', $orderId)
            ->get();
    }
}
