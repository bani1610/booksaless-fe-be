import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'

// Halaman profil: bisa dibuka oleh semua pengguna yang login (user maupun admin)
function Account() {
  const navigate = useNavigate()
  const { user, role, isAdmin, logout } = useAuth()

  async function handleLogout() {
    await logout()
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
          <p className="muted">Ini halaman profil akun Anda.</p>
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
          <div>
            <dt>Peran</dt>
            <dd>
              <span className={`role-badge role-${role}`}>{isAdmin ? 'Admin' : 'User'}</span>
            </dd>
          </div>
        </dl>
        {isAdmin && (
          <Link to="/admin" className="btn btn-primary btn-block">
            Buka dashboard admin
          </Link>
        )}
        <Link to="/" className={`btn btn-block ${isAdmin ? 'btn-ghost' : 'btn-primary'}`}>
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
