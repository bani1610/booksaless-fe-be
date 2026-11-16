import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Alert from '../../components/Alert.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import { api } from '../../lib/api.js'
import { formatRupiah } from '../../lib/format.js'

function BookList() {
  const location = useLocation()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(location.state?.success ?? '')
  const [target, setTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    api
      .getBooks()
      .then((res) => setBooks(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  function openDelete(book) {
    setDeleteError('')
    setTarget(book)
  }

  async function handleDelete() {
    setDeleting(true)
    setDeleteError('')
    try {
      await api.deleteBook(target.id)
      setBooks((list) => list.filter((b) => b.id !== target.id))
      setSuccess(`Buku "${target.title}" berhasil dihapus.`)
      setTarget(null)
    } catch (err) {
      setDeleteError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Buku</h1>
          <p className="muted">Judul, harga, dan stok buku yang dijual.</p>
        </div>
        <Link to="/admin/books/create" className="btn btn-primary">
          Tambah buku
        </Link>
      </header>

      <Alert type="success">{success}</Alert>
      <Alert>{error}</Alert>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th className="col-num">#</th>
              <th>Judul</th>
              <th>Genre</th>
              <th>Author</th>
              <th className="col-money">Harga</th>
              <th className="col-num">Stok</th>
              <th className="col-actions">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="7" className="empty">Memuat data…</td>
              </tr>
            )}
            {!loading && books.length === 0 && (
              <tr>
                <td colSpan="7" className="empty">
                  Belum ada buku. <Link to="/admin/books/create">Tambahkan yang pertama</Link>.
                </td>
              </tr>
            )}
            {books.map((book, i) => (
              <tr key={book.id}>
                <td className="col-num">{i + 1}</td>
                <td className="strong">{book.title}</td>
                <td className="muted">{book.genre?.name ?? '-'}</td>
                <td className="muted">{book.author?.name ?? '-'}</td>
                <td className="col-money">{formatRupiah(book.price)}</td>
                <td className="col-num">{book.stock}</td>
                <td className="col-actions">
                  <div className="row-actions">
                    <Link
                      to={`/admin/books/${book.id}/edit`}
                      className="btn btn-ghost btn-sm"
                      aria-label={`Ubah buku ${book.title}`}
                    >
                      Ubah
                    </Link>
                    <button
                      type="button"
                      className="btn btn-danger-ghost btn-sm"
                      onClick={() => openDelete(book)}
                      aria-label={`Hapus buku ${book.title}`}
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
        title="Hapus buku?"
        confirmLabel="Ya, hapus buku"
        busy={deleting}
        error={deleteError}
        onConfirm={handleDelete}
        onCancel={() => setTarget(null)}
      >
        <p>
          Buku <strong>{target?.title}</strong> akan dihapus permanen dari database.
        </p>
        <p className="muted">Buku yang sudah pernah dibeli tidak dapat dihapus agar riwayat transaksi tetap utuh.</p>
      </ConfirmDialog>
    </>
  )
}

export default BookList
