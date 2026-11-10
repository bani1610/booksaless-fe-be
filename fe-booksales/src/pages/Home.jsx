import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Alert from '../components/Alert.jsx'
import BookCard from '../components/store/BookCard.jsx'
import SiteHeader from '../components/store/SiteHeader.jsx'
import { useAuth } from '../auth/useAuth.js'
import { api } from '../lib/api.js'

function Home() {
  const { isAuthenticated } = useAuth()
  const [books, setBooks] = useState([])
  const [genres, setGenres] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [genreId, setGenreId] = useState('all')
  const [query, setQuery] = useState('')

  useEffect(() => {
    Promise.all([api.getBooks(), api.getGenres()])
      .then(([bookRes, genreRes]) => {
        setBooks(bookRes.data)
        setGenres(genreRes.data)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // Filter dilakukan di klien karena jumlah buku masih sedikit
  const visibleBooks = useMemo(() => {
    const q = query.trim().toLowerCase()
    return books.filter((book) => {
      if (genreId !== 'all' && book.genre_id !== genreId) return false
      if (!q) return true
      return (
        book.title.toLowerCase().includes(q) ||
        (book.author?.name ?? '').toLowerCase().includes(q)
      )
    })
  }, [books, genreId, query])

  const authorCount = new Set(books.map((b) => b.author_id)).size

  function resetFilter() {
    setGenreId('all')
    setQuery('')
  }

  return (
    <div className="site">
      <SiteHeader />

      <main>
        <section className="hero">
          <div className="site-inner hero-inner">
            <div className="hero-text">
              <h1>Buku pilihan dari penulis Indonesia.</h1>
              <p>
                Telusuri novel dan bacaan dari Tere Liye, Andrea Hirata, Dee Lestari, dan penulis
                lainnya. Lihat harga dan stok terbaru sebelum membeli.
              </p>
              <div className="hero-actions">
                <a href="#katalog" className="btn btn-primary">
                  Lihat katalog
                </a>
                {!isAuthenticated && (
                  <Link to="/register" className="btn btn-ghost">
                    Buat akun gratis
                  </Link>
                )}
              </div>
            </div>
            {!loading && !error && (
              <dl className="hero-stats">
                <div>
                  <dt>Judul buku</dt>
                  <dd>{books.length}</dd>
                </div>
                <div>
                  <dt>Genre</dt>
                  <dd>{genres.length}</dd>
                </div>
                <div>
                  <dt>Penulis</dt>
                  <dd>{authorCount}</dd>
                </div>
              </dl>
            )}
          </div>
        </section>

        <section id="katalog" className="site-inner catalog">
          <div className="catalog-head">
            <h2>Katalog buku</h2>
            <label className="catalog-search">
              <span className="sr-only">Cari judul atau penulis</span>
              <input
                type="search"
                placeholder="Cari judul atau penulis…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
          </div>

          <div className="chips" role="group" aria-label="Filter genre">
            <button
              type="button"
              className={genreId === 'all' ? 'chip active' : 'chip'}
              aria-pressed={genreId === 'all'}
              onClick={() => setGenreId('all')}
            >
              Semua
            </button>
            {genres.map((genre) => (
              <button
                key={genre.id}
                type="button"
                className={genreId === genre.id ? 'chip active' : 'chip'}
                aria-pressed={genreId === genre.id}
                onClick={() => setGenreId(genre.id)}
              >
                {genre.name}
              </button>
            ))}
          </div>

          <Alert>{error && `Katalog gagal dimuat: ${error}`}</Alert>

          {loading && <p className="muted">Memuat katalog…</p>}

          {!loading && !error && visibleBooks.length === 0 && (
            <div className="card empty">
              <p>Tidak ada buku yang cocok dengan pencarian ini.</p>
              <button type="button" className="btn btn-ghost btn-sm" onClick={resetFilter}>
                Tampilkan semua buku
              </button>
            </div>
          )}

          {visibleBooks.length > 0 && (
            <div className="book-grid">
              {visibleBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-inner">© {new Date().getFullYear()} Booksales</div>
      </footer>
    </div>
  )
}

export default Home
