import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'
import FullPageLoader from '../components/FullPageLoader.jsx'

// Membungkus sekelompok route. Tanpa allowedRoles: cukup login.
// Dengan allowedRoles: hanya peran yang disebut yang boleh masuk.
function ProtectedRoute({ allowedRoles = [] }) {
  const { status, isAuthenticated, hasRole } = useAuth()
  const location = useLocation()

  if (status === 'checking') return <FullPageLoader />

  if (!isAuthenticated) {
    // Simpan alamat tujuan agar setelah login pengguna dikembalikan ke sini
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!hasRole(allowedRoles)) {
    return <Navigate to="/403" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

export default ProtectedRoute
