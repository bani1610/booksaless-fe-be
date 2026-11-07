import BookCover from './BookCover.jsx'
import { formatRupiah } from '../../lib/format.js'

function BookCard({ book }) {
  const soldOut = book.stock <= 0

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
      </div>
    </article>
  )
}

export default BookCard
