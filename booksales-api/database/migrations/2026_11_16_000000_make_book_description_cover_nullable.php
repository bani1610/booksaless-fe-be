<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Validasi BookController sudah menganggap kedua kolom opsional, tetapi kolomnya NOT NULL
    // sehingga buku tanpa deskripsi/sampul gagal disimpan (error 500).
    public function up(): void
    {
        Schema::table('books', function (Blueprint $table) {
            $table->text('description')->nullable()->change();
            $table->string('cover_photo')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('books', function (Blueprint $table) {
            $table->text('description')->nullable(false)->change();
            $table->string('cover_photo')->nullable(false)->change();
        });
    }
};
