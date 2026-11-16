<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

abstract class Controller
{
    /** Aturan validasi untuk file foto yang diunggah (maks. 2 MB). */
    protected const PHOTO_RULE = 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048';

    /**
     * Jika ada file "{$field}_file", simpan ke disk public dan isi $field dengan URL-nya.
     * Tanpa file, nilai $field (URL yang diketik) dipakai apa adanya.
     */
    protected function withUploadedPhoto(Request $request, array $data, string $field, string $folder): array
    {
        unset($data[$field . '_file']);

        if ($request->hasFile($field . '_file')) {
            $path = $request->file($field . '_file')->store($folder, 'public');
            // URL absolut dari host request (bukan APP_URL), supaya benar lewat proxy Vite maupun di hosting.
            // shortcut: file lama tidak dihapus saat diganti, tambahkan pembersihan bila storage mulai penuh
            $data[$field] = $request->getSchemeAndHttpHost() . '/storage/' . $path;
        }

        return $data;
    }
}
