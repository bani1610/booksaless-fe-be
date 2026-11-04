<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BookSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('books')->insert([
            [
                'id' => 1,
                'title' => 'Bumi',
                'description' => 'Novel fantasi petualangan.',
                'price' => 95000,
                'stock' => 20,
                'cover_photo' => 'bumi.jpg',
                'genre_id' => 1,
                'author_id' => 1
            ],
            [
                'id' => 2,
                'title' => 'Laskar Pelangi',
                'description' => 'Novel tentang pendidikan.',
                'price' => 85000,
                'stock' => 15,
                'cover_photo' => 'laskar-pelangi.jpg',
                'genre_id' => 5,
                'author_id' => 2
            ],
            [
                'id' => 3,
                'title' => 'Supernova',
                'description' => 'Novel fiksi ilmiah.',
                'price' => 110000,
                'stock' => 10,
                'cover_photo' => 'supernova.jpg',
                'genre_id' => 1,
                'author_id' => 3
            ],
            [
                'id' => 4,
                'title' => 'Ayat-Ayat Cinta',
                'description' => 'Novel romantis religi.',
                'price' => 90000,
                'stock' => 25,
                'cover_photo' => 'ayat-ayat-cinta.jpg',
                'genre_id' => 1,
                'author_id' => 4
            ],
            [
                'id' => 5,
                'title' => 'Bumi Manusia',
                'description' => 'Novel berlatar sejarah.',
                'price' => 120000,
                'stock' => 12,
                'cover_photo' => 'bumi-manusia.jpg',
                'genre_id' => 4,
                'author_id' => 5
            ]
        ]);
    }
}

