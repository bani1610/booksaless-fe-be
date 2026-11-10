import { Link, useLocation } from 'react-router-dom'
import { homePathFor } from '../auth/authService.js'
import { useAuth } from '../auth/useAuth.js'

// Ditampilkan saat pengguna login tetapi perannya tidak diizinkan membuka halaman
function Forbidden() {
  const { user } = useAuth()
  const location = useLocation()
  const blockedPath = location.state?.from

  return (
    <div className="auth-page">
      <div className="card auth-card auth-success">
        <span className="status-code">403</span>
        <h1>Akses ditolak</h1>
        <p className="muted">
          {blockedPath ? (
            <>
              Halaman <code>{blockedPath}</code> hanya dapat dibuka oleh admin.
            </>
          ) : (
            'Anda tidak memiliki izin untuk membuka halaman ini.'
          )}{' '}
          Akun Anda terdaftar sebagai <strong>{user?.is_admin ? 'admin' : 'user'}</strong>.
        </p>
        <Link to={homePathFor(user)} className="btn btn-primary btn-block">
          Kembali ke halaman saya
        </Link>
        <Link to="/" className="btn btn-ghost btn-block">
          Ke beranda
        </Link>
      </div>
    </div>
  )
}

export default Forbidden
