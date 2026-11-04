<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AuthorSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('authors')->insert([
            [
                'id' => 1,
                'name' => 'Tere Liye',
                'photo' => 'tere-liye.jpg',
                'bio' => 'Penulis novel terkenal di Indonesia.'
            ],
            [
                'id' => 2,
                'name' => 'Andrea Hirata',
                'photo' => 'andrea-hirata.jpg',
                'bio' => 'Penulis novel Laskar Pelangi.'
            ],
            [
                'id' => 3,
                'name' => 'Dee Lestari',
                'photo' => 'dee-lestari.jpg',
                'bio' => 'Penulis dan penyanyi terkenal di Indonesia.'
            ],
            [
                'id' => 4,
                'name' => 'Habiburrahman El Shirazy',
                'photo' => 'habiburrahman.jpg',
                'bio' => 'Novelis no. 1 Indonesia, sastrawan, dan budayawan.'
            ],
            [
                'id' => 5,
                'name' => 'Pramoedya Ananta Toer',
                'photo' => 'pramoedya.jpg',
                'bio' => 'Salah satu sastrawan terbesar dalam sejarah sastra Indonesia modern.'
            ],
        ]);
    }
}
