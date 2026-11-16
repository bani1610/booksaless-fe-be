import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Alert from '../../components/Alert.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import { useAuth } from '../../auth/useAuth.js'
import { api } from '../../lib/api.js'

function UserList() {
  const location = useLocation()
  const { user: me } = useAuth()
  const [users, setUsers] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(location.state?.success ?? '')
  const [target, setTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    api
      .getUsers()
      .then((res) => setUsers(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // Pencarian di klien karena jumlah akun masih sedikit
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) =>
      [u.name, u.username, u.email].some((v) => (v ?? '').toLowerCase().includes(q)),
    )
  }, [users, query])

  async function handleDelete() {
    setDeleting(true)
    setDeleteError('')
    try {
      await api.deleteUser(target.id)
      setUsers((list) => list.filter((u) => u.id !== target.id))
      setSuccess(`Akun "${target.name}" berhasil dihapus.`)
      setTarget(null)
    } catch (err) {
      setDeleteError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  const adminCount = users.filter((u) => u.is_admin).length

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Akun</h1>
          <p className="muted">
            {users.length} akun · {adminCount} admin · {users.length - adminCount} customer
          </p>
        </div>
        <Link to="/admin/users/create" className="btn btn-primary">
          Tambah akun
        </Link>
      </header>

      <Alert type="success">{success}</Alert>
      <Alert>{error}</Alert>

      <label className="search">
        <span className="sr-only">Cari nama, username, atau email</span>
        <input
          type="search"
          placeholder="Cari nama, username, atau email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Username</th>
              <th>Email</th>
              <th>Peran</th>
              <th className="col-num">Transaksi</th>
              <th className="col-actions">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="6" className="empty">Memuat data…</td>
              </tr>
            )}
            {!loading && visible.length === 0 && (
              <tr>
                <td colSpan="6" className="empty">Tidak ada akun yang cocok.</td>
              </tr>
            )}
            {visible.map((u) => {
              const isMe = u.id === me?.id
              return (
                <tr key={u.id}>
                  <td className="strong">
                    {u.name} {isMe && <span className="muted small">(Anda)</span>}
                  </td>
                  <td className="muted">{u.username ? `@${u.username}` : '-'}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`role-badge ${u.is_admin ? 'role-admin' : 'role-user'}`}>
                      {u.is_admin ? 'Admin' : 'Customer'}
                    </span>
                  </td>
                  <td className="col-num">{u.transactions_count}</td>
                  <td className="col-actions">
                    <div className="row-actions">
                      <Link
                        to={`/admin/users/${u.id}/edit`}
                        className="btn btn-ghost btn-sm"
                        aria-label={`Ubah akun ${u.name}`}
                      >
                        Ubah
                      </Link>
                      {/* Akun sendiri tidak bisa dihapus (juga dijaga di API) */}
                      {!isMe && (
                        <button
                          type="button"
                          className="btn btn-danger-ghost btn-sm"
                          onClick={() => {
                            setDeleteError('')
                            setTarget(u)
                          }}
                          aria-label={`Hapus akun ${u.name}`}
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={Boolean(target)}
        title="Hapus akun?"
        confirmLabel="Ya, hapus akun"
        busy={deleting}
        error={deleteError}
        onConfirm={handleDelete}
        onCancel={() => setTarget(null)}
      >
        <p>
          Akun <strong>{target?.name}</strong> ({target?.email}) akan dihapus permanen.
        </p>
        {target?.transactions_count > 0 && (
          <p className="muted">
            Akun ini memiliki {target.transactions_count} transaksi, sehingga API akan menolak penghapusan.
          </p>
        )}
      </ConfirmDialog>
    </>
  )
}

export default UserList
