import { Link, useNavigate } from 'react-router-dom'
import { api, clearSession, getUser } from '../lib/api.js'

function Account() {
  const navigate = useNavigate()
  const user = getUser()

  async function handleLogout() {
    try {
      await api.logout()
    } catch {
      // Token mungkin sudah kedaluwarsa; sesi lokal tetap dihapus
    }
    clearSession()
    navigate('/', { replace: true })
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <Link to="/" className="brand brand-link">
          <span className="brand-mark">B</span>
          <span>Booksales</span>
        </Link>
        <div>
          <h1>Halo, {user?.name}</h1>
          <p className="muted">Anda masuk sebagai customer.</p>
        </div>
        <dl className="account-info">
          <div>
            <dt>Username</dt>
            <dd>{user?.username ? `@${user.username}` : '-'}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{user?.email}</dd>
          </div>
        </dl>
        <Link to="/" className="btn btn-primary btn-block">
          Lihat katalog buku
        </Link>
        <button type="button" className="btn btn-ghost btn-block" onClick={handleLogout}>
          Keluar
        </button>
      </div>
    </div>
  )
}

export default Account
