import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Alert from '../../components/Alert.jsx'
import { api } from '../../lib/api.js'

function GenreList() {
  const location = useLocation()
  const [genres, setGenres] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .getGenres()
      .then((res) => setGenres(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Genre</h1>
          <p className="muted">Kategori buku yang tersedia di toko.</p>
        </div>
        <Link to="/admin/genres/create" className="btn btn-primary">
          Tambah genre
        </Link>
      </header>

      <Alert type="success">{location.state?.success}</Alert>
      <Alert>{error}</Alert>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th className="col-num">#</th>
              <th>Nama</th>
              <th>Deskripsi</th>
              <th className="col-num">Buku</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="4" className="empty">Memuat data…</td>
              </tr>
            )}
            {!loading && genres.length === 0 && (
              <tr>
                <td colSpan="4" className="empty">
                  Belum ada genre. <Link to="/admin/genres/create">Tambahkan yang pertama</Link>.
                </td>
              </tr>
            )}
            {genres.map((genre, i) => (
              <tr key={genre.id}>
                <td className="col-num">{i + 1}</td>
                <td className="strong">{genre.name}</td>
                <td className="muted">{genre.description}</td>
                <td className="col-num">{genre.books?.length ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default GenreList
