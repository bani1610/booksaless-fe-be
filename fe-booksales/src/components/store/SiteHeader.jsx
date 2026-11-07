import { Link } from 'react-router-dom'
import { getToken, getUser } from '../../lib/api.js'

function SiteHeader() {
  const user = getToken() ? getUser() : null

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
            <Link to={user.is_admin ? '/admin' : '/akun'} className="btn btn-primary btn-sm">
              {user.is_admin ? 'Dashboard' : 'Akun saya'}
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
