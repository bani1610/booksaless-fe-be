import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Alert from '../components/Alert.jsx'
import BookCard from '../components/store/BookCard.jsx'
import BookCover from '../components/store/BookCover.jsx'
import SiteHeader from '../components/store/SiteHeader.jsx'
import { useAuth } from '../auth/useAuth.js'
import { useCart } from '../cart/useCart.js'
import { api } from '../lib/api.js'
import { coverColor } from '../lib/format.js'

function Home() {
  const { isAuthenticated, isAdmin } = useAuth()
  const cart = useCart()
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

  // Rak genre: tinggi punggung buku mengikuti jumlah judul di genre tersebut
  const shelf = useMemo(() => {
    const counts = genres.map((g) => ({ ...g, count: books.filter((b) => b.genre_id === g.id).length }))
    const max = Math.max(1, ...counts.map((g) => g.count))
    return counts.map((g) => ({ ...g, height: 150 + Math.round((g.count / max) * 70) }))
  }, [genres, books])

  // Tiga sampul untuk hero diambil dari buku yang masih ada stoknya
  const heroBooks = books.filter((b) => b.stock > 0).slice(0, 3)
  const authorCount = new Set(books.map((b) => b.author_id)).size

  function resetFilter() {
    setGenreId('all')
    setQuery('')
  }

  function browseGenre(id) {
    setGenreId(id)
    document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
                lainnya. Lihat harga dan stok terbaru, lalu bayar langsung lewat Durianpay.
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
                {cart.enabled && cart.count > 0 && (
                  <Link to="/keranjang" className="btn btn-ghost">
                    Lanjut ke keranjang ({cart.count})
                  </Link>
                )}
                {isAdmin && (
                  <Link to="/admin" className="btn btn-ghost">
                    Buka dashboard
                  </Link>
                )}
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

            {heroBooks.length > 0 && (
              <div className="hero-stack" aria-hidden="true">
                {heroBooks.map((book, i) => (
                  <div key={book.id} className={`hero-book hero-book-${i}`}>
                    <BookCover book={book} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {shelf.length > 0 && (
          <section className="site-inner shelf-section" aria-labelledby="shelf-title">
            <div className="shelf-head">
              <h2 id="shelf-title">Jelajahi per genre</h2>
              <p className="muted">Pilih punggung buku untuk melihat judul di genre tersebut.</p>
            </div>
            <div className="shelf">
              {shelf.map((g, i) => (
                <button
                  key={g.id}
                  type="button"
                  className="spine"
                  style={{ '--spine': coverColor(g.id), '--h': `${g.height}px`, '--i': i }}
                  onClick={() => browseGenre(g.id)}
                  aria-label={`${g.name}, ${g.count} buku`}
                >
                  <span className="spine-name">{g.name}</span>
                  <span className="spine-count">{g.count} buku</span>
                </button>
              ))}
            </div>
          </section>
        )}

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

        {!isAuthenticated && (
          <section className="join">
            <div className="site-inner join-inner">
              <div>
                <h2>Belanja buku dalam tiga langkah.</h2>
                <ol className="join-steps">
                  <li>
                    <strong>Daftar</strong> dengan email, gratis.
                  </li>
                  <li>
                    <strong>Pilih buku</strong> dan masukkan ke keranjang.
                  </li>
                  <li>
                    <strong>Bayar</strong> lewat Durianpay, pesanan tercatat di riwayat Anda.
                  </li>
                </ol>
              </div>
              <div className="join-actions">
                <Link to="/register" className="btn btn-light">
                  Buat akun gratis
                </Link>
                <Link to="/login" className="join-login">
                  Sudah punya akun? Masuk
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="site-footer">
        <div className="site-inner footer-inner">
          <span className="brand">
            <span className="brand-mark">B</span>
            <span>Booksales</span>
          </span>
          <nav className="footer-nav" aria-label="Navigasi bawah">
            <a href="#katalog">Katalog</a>
            {isAuthenticated ? (
              <Link to={isAdmin ? '/admin' : '/akun'}>{isAdmin ? 'Dashboard' : 'Akun saya'}</Link>
            ) : (
              <>
                <Link to="/login">Masuk</Link>
                <Link to="/register">Daftar</Link>
              </>
            )}
          </nav>
          <span className="muted">© {new Date().getFullYear()} Booksales</span>
        </div>
      </footer>
    </div>
  )
}

export default Home
