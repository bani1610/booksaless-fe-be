import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Alert from '../../components/Alert.jsx'
import { api } from '../../lib/api.js'

function AuthorList() {
  const location = useLocation()
  const [authors, setAuthors] = useState([])
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .getAuthors(query)
      .then((res) => {
        setAuthors(res.data)
        setError('')
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [query])

  function handleSearch(e) {
    e.preventDefault()
    setLoading(true)
    setQuery(search.trim())
  }

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Author</h1>
          <p className="muted">Penulis buku yang terdaftar.</p>
        </div>
        <Link to="/admin/authors/create" className="btn btn-primary">
          Tambah author
        </Link>
      </header>

      <Alert type="success">{location.state?.success}</Alert>
      <Alert>{error}</Alert>

      <form className="search" onSubmit={handleSearch} role="search">
        <input
          type="search"
          placeholder="Cari nama atau bio author"
          aria-label="Cari author"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn-ghost">Cari</button>
      </form>

      {loading && <p className="muted">Memuat data…</p>}
      {!loading && authors.length === 0 && (
        <div className="card empty">
          {query ? `Tidak ada author yang cocok dengan "${query}".` : 'Belum ada author.'}
        </div>
      )}

      <div className="author-grid">
        {authors.map((author) => (
          <article key={author.id} className="card author-card">
            <Avatar name={author.name} photo={author.photo} />
            <div className="author-body">
              <h2>{author.name}</h2>
              <p className="muted author-bio">{author.bio}</p>
              <span className="badge">{author.books?.length ?? 0} buku</span>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}

function Avatar({ name, photo }) {
  const [broken, setBroken] = useState(false)
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  if (photo && /^https?:\/\//.test(photo) && !broken) {
    return <img className="avatar" src={photo} alt="" onError={() => setBroken(true)} />
  }
  return <span className="avatar" aria-hidden="true">{initials}</span>
}

export default AuthorList
