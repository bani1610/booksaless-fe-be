import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Alert from '../../components/Alert.jsx'
import { api } from '../../lib/api.js'

function Dashboard() {
  const [counts, setCounts] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.getGenres(), api.getAuthors()])
      .then(([genres, authors]) =>
        setCounts({ genres: genres.data.length, authors: authors.data.length }),
      )
      .catch((err) => setError(err.message))
  }, [])

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">Ringkasan master data toko buku.</p>
        </div>
      </header>
      <Alert>{error}</Alert>
      <div className="stats">
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
