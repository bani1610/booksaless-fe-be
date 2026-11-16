<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Foto author opsional: validasi sudah nullable, kolomnya belum
    public function up(): void
    {
        Schema::table('authors', function (Blueprint $table) {
            $table->string('photo')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('authors', function (Blueprint $table) {
            $table->string('photo')->nullable(false)->change();
        });
    }
};
