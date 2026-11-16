import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Alert from '../../components/Alert.jsx'
import { api } from '../../lib/api.js'
import { formatRupiah } from '../../lib/format.js'

function Dashboard() {
  const [counts, setCounts] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.getBooks(), api.getGenres(), api.getAuthors(), api.getTransactions()])
      .then(([books, genres, authors, transactions]) =>
        setCounts({
          books: books.data.length,
          genres: genres.data.length,
          authors: authors.data.length,
          transactions: transactions.data.length,
          revenue: transactions.data
            .filter((t) => t.payment_status === 'paid')
            .reduce((sum, t) => sum + Number(t.total_amount), 0),
        }),
      )
      .catch((err) => setError(err.message))
  }, [])

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">Ringkasan penjualan dan master data toko buku.</p>
        </div>
      </header>
      <Alert>{error}</Alert>
      <div className="stats">
        <Link to="/admin/transactions" className="card stat">
          <span className="stat-label">Penjualan lunas</span>
          <span className="stat-value">{counts ? formatRupiah(counts.revenue) : '–'}</span>
        </Link>
        <Link to="/admin/transactions" className="card stat">
          <span className="stat-label">Total transaksi</span>
          <span className="stat-value">{counts ? counts.transactions : '–'}</span>
        </Link>
        <Link to="/admin/books" className="card stat">
          <span className="stat-label">Total buku</span>
          <span className="stat-value">{counts ? counts.books : '–'}</span>
        </Link>
        <Link to="/admin/genres" className="card stat">
          <span className="stat-label">Total genre</span>
          <span className="stat-value">{counts ? counts.genres : '–'}</span>
        </Link>
        <Link to="/admin/authors" className="card stat">
          <span className="stat-label">Total author</span>
          <span className="stat-value">{counts ? counts.authors : '–'}</span>
        </Link>
      </div>
    </>
  )
}

export default Dashboard
