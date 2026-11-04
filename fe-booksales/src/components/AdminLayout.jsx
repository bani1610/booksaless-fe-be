import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { api, clearSession, getUser } from '../lib/api.js'

function AdminLayout() {
  const navigate = useNavigate()
  const user = getUser()

  async function handleLogout() {
    try {
      await api.logout()
    } catch {
      // Token mungkin sudah kedaluwarsa; sesi lokal tetap dihapus
    }
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <div className="admin">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">B</span>
          <span>Booksales</span>
        </div>
        <nav>
          <NavLink to="/admin" end>Dashboard</NavLink>
          <p className="nav-label">Master data</p>
          <NavLink to="/admin/genres">Genre</NavLink>
          <NavLink to="/admin/authors">Author</NavLink>
        </nav>
        <div className="sidebar-footer">
          <p className="user-name">{user?.name}</p>
          <p className="user-email">{user?.email}</p>
          <button type="button" className="btn btn-ghost" onClick={handleLogout}>
            Keluar
          </button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
