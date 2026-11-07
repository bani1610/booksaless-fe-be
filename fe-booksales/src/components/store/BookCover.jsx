import { useState } from 'react'

// Warna sampul dipilih dari id genre supaya buku satu genre terlihat seragam
const PALETTE = ['#1f5c4a', '#7a3b2e', '#2f4a73', '#6b4f1d', '#4b3a6b', '#2e5e63']

function BookCover({ book }) {
  const [broken, setBroken] = useState(false)
  const src = book.cover_photo
  const isUrl = src && /^https?:\/\//.test(src)

  if (isUrl && !broken) {
    return (
      <img className="cover" src={src} alt={`Sampul ${book.title}`} onError={() => setBroken(true)} />
    )
  }

  // File sampul belum tersedia di server, jadi dibuat sampul berbentuk teks
  const color = PALETTE[(book.genre_id ?? book.id) % PALETTE.length]
  return (
    <div className="cover cover-text" style={{ '--cover': color }} aria-hidden="true">
      <span className="cover-title">{book.title}</span>
      <span className="cover-author">{book.author?.name}</span>
    </div>
  )
}

export default BookCover
