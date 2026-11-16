import { useState } from 'react'
import { Link } from 'react-router-dom'
import BookCover from './BookCover.jsx'
import { useAuth } from '../../auth/useAuth.js'
import { useCart } from '../../cart/useCart.js'
import { formatRupiah } from '../../lib/format.js'
import { useToast } from '../../toast/useToast.js'

function BookCard({ book }) {
  const { isAuthenticated } = useAuth()
  const cart = useCart()
  const toast = useToast()
  // Bertambah setiap klik agar animasi "pop" pada tombol diputar ulang (lewat key)
  const [pops, setPops] = useState(0)
  const soldOut = book.stock <= 0
  const inCart = cart.quantityOf(book.id)
  const maxed = inCart >= book.stock

  function handleAdd() {
    cart.addItem(book)
    setPops((n) => n + 1)
    toast.success(`"${book.title}" masuk keranjang`, {
      message: `Jumlah di keranjang: ${inCart + 1}`,
      action: { label: 'Lihat keranjang →', to: '/keranjang' },
    })
  }

  return (
    <article className="book-card">
      <BookCover book={book} />
      <div className="book-body">
        {book.genre && <span className="badge">{book.genre.name}</span>}
        <h3>{book.title}</h3>
        <p className="book-author">{book.author?.name}</p>
        {book.description && <p className="book-desc">{book.description}</p>}
        <div className="book-meta">
          <span className="book-price">{formatRupiah(book.price)}</span>
          <span className={soldOut ? 'book-stock out' : 'book-stock'}>
            {soldOut ? 'Stok habis' : `Stok ${book.stock}`}
          </span>
        </div>
        {/* Admin tidak membeli, jadi tombol hanya untuk tamu dan customer */}
        {!isAuthenticated && !soldOut && (
          <Link to="/login" state={{ from: '/' }} className="btn btn-ghost btn-sm book-action">
            Masuk untuk membeli
          </Link>
        )}
        {cart.enabled && (
          <button
            type="button"
            className="btn btn-primary btn-sm book-action"
            disabled={soldOut || maxed}
            onClick={handleAdd}
            aria-label={`Tambah ${book.title} ke keranjang`}
          >
            {/* Animasi pada label, bukan tombol, supaya fokus keyboard tidak hilang */}
            <span key={pops} className={pops ? 'pop' : undefined}>
              {soldOut ? 'Stok habis' : maxed ? 'Stok maksimal di keranjang' : inCart ? `✓ Di keranjang (${inCart}) · tambah lagi` : 'Tambah ke keranjang'}
            </span>
          </button>
        )}
      </div>
    </article>
  )
}

export default BookCard
