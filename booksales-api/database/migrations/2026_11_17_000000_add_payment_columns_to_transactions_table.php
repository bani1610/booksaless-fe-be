<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            // pending -> menunggu pembayaran, paid -> lunas, cancelled -> dibatalkan (stok sudah dikembalikan)
            $table->string('payment_status', 20)->default('pending')->after('total_amount');
            // Satu checkout (beberapa buku) = satu order Durianpay, jadi kolom ini mengelompokkan transaksi
            $table->string('payment_order_id')->nullable()->index()->after('payment_status');
            $table->string('payment_id')->nullable()->after('payment_order_id');
            $table->timestamp('paid_at')->nullable()->after('payment_id');
        });

        // Transaksi lama dibuat sebelum ada pembayaran online, dianggap sudah lunas
        DB::table('transactions')->update(['payment_status' => 'paid']);
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex(['payment_order_id']);
            $table->dropColumn(['payment_status', 'payment_order_id', 'payment_id', 'paid_at']);
        });
    }
};
