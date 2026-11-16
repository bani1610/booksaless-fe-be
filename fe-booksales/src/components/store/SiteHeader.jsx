import { Link } from 'react-router-dom'
import { homePathFor } from '../../auth/authService.js'
import { useAuth } from '../../auth/useAuth.js'
import { useCart } from '../../cart/useCart.js'

function SiteHeader() {
  const { user, isAdmin } = useAuth()
  const cart = useCart()

  return (
    <header className="site-header">
      <div className="site-inner">
        <Link to="/" className="brand site-brand">
          <span className="brand-mark">B</span>
          <span>Booksales</span>
        </Link>
        <nav className="site-nav" aria-label="Navigasi utama">
          {/* Link biasa agar dari halaman lain tetap melompat ke bagian katalog */}
          <a href="/#katalog" className="site-nav-link">
            Katalog
          </a>
          {cart.enabled && (
            <>
              <Link to="/pesanan" className="site-nav-link">
                Pesanan
              </Link>
              <Link to="/keranjang" className="site-nav-link site-nav-cart" aria-label={`Keranjang, ${cart.count} buku`}>
                {/* key berganti saat jumlah berubah, sehingga badge berdenyut sebagai tanda */}
                Keranjang <span key={cart.count} className="cart-count bump">{cart.count}</span>
              </Link>
            </>
          )}
          {user ? (
            // Tombol menyesuaikan peran: admin ke dashboard, user ke halaman akun
            <Link to={isAdmin ? homePathFor(user) : '/akun'} className="btn btn-primary btn-sm">
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
