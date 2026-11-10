import { Link } from 'react-router-dom'
import { homePathFor } from '../../auth/authService.js'
import { useAuth } from '../../auth/useAuth.js'

function SiteHeader() {
  const { user, isAdmin } = useAuth()

  return (
    <header className="site-header">
      <div className="site-inner">
        <Link to="/" className="brand site-brand">
          <span className="brand-mark">B</span>
          <span>Booksales</span>
        </Link>
        <nav className="site-nav" aria-label="Navigasi utama">
          <a href="#katalog" className="site-nav-link">
            Katalog
          </a>
          {user ? (
            // Tombol menyesuaikan peran: admin ke dashboard, user ke halaman akun
            <Link to={homePathFor(user)} className="btn btn-primary btn-sm">
              {isAdmin ? 'Dashboard' : 'Akun saya'}
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">
                Masuk
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Daftar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default SiteHeader
