import { useState } from 'react'
import { coverColor } from '../../lib/format.js'

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
  const color = coverColor(book.genre_id ?? book.id)
  return (
    <div className="cover cover-text" style={{ '--cover': color }} aria-hidden="true">
      <span className="cover-title">{book.title}</span>
      <span className="cover-author">{book.author?.name}</span>
    </div>
  )
}

export default BookCover
