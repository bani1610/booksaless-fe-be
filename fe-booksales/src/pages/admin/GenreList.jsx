import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Alert from '../../components/Alert.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import { api } from '../../lib/api.js'

function GenreList() {
  const location = useLocation()
  const [genres, setGenres] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(location.state?.success ?? '')
  const [target, setTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    api
      .getGenres()
      .then((res) => setGenres(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  function openDelete(genre) {
    setDeleteError('')
    setTarget(genre)
  }

  async function handleDelete() {
    setDeleting(true)
    setDeleteError('')
    try {
      await api.deleteGenre(target.id)
      setGenres((list) => list.filter((g) => g.id !== target.id))
      setSuccess(`Genre "${target.name}" berhasil dihapus.`)
      setTarget(null)
    } catch (err) {
      setDeleteError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  const bookCount = target?.books?.length ?? 0

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

      <Alert type="success">{success}</Alert>
      <Alert>{error}</Alert>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th className="col-num">#</th>
              <th>Nama</th>
              <th>Deskripsi</th>
              <th className="col-num">Buku</th>
              <th className="col-actions">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="5" className="empty">Memuat data…</td>
              </tr>
            )}
            {!loading && genres.length === 0 && (
              <tr>
                <td colSpan="5" className="empty">
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
                <td className="col-actions">
                  <div className="row-actions">
                    <Link
                      to={`/admin/genres/${genre.id}/edit`}
                      className="btn btn-ghost btn-sm"
                      aria-label={`Ubah genre ${genre.name}`}
                    >
                      Ubah
                    </Link>
                    <button
                      type="button"
                      className="btn btn-danger-ghost btn-sm"
                      onClick={() => openDelete(genre)}
                      aria-label={`Hapus genre ${genre.name}`}
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={Boolean(target)}
        title="Hapus genre?"
        confirmLabel="Ya, hapus genre"
        busy={deleting}
        error={deleteError}
        onConfirm={handleDelete}
        onCancel={() => setTarget(null)}
      >
        <p>
          Genre <strong>{target?.name}</strong> akan dihapus permanen dari database.
        </p>
        {bookCount > 0 && (
          <p className="muted">
            Genre ini masih dipakai {bookCount} buku, sehingga API akan menolak penghapusan.
          </p>
        )}
      </ConfirmDialog>
    </>
  )
}

export default GenreList
