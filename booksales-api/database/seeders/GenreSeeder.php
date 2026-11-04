<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GenreSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('genres')->insert([
            [
                'id' => 1,
                'name' => 'Fiksi',
                'description' => 'Buku cerita imajinatif'
            ],
            [
                'id' => 2,
                'name' => 'Non-Fiksi',
                'description' => 'Buku berdasarkan fakta'
            ],
            [
                'id' => 3,
                'name' => 'Teknologi',
                'description' => 'Buku tentang teknologi'
            ],
            [
                'id' => 4,
                'name' => 'Sejarah',
                'description' => 'Buku tentang sejarah'
            ],
            [
                'id' => 5,
                'name' => 'Pendidikan',
                'description' => 'Buku untuk pembelajaran'
            ]
        ]);
    }
}
