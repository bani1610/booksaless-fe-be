import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { homePathFor } from '../auth/authService.js'
import { useAuth } from '../auth/useAuth.js'
import FullPageLoader from '../components/FullPageLoader.jsx'

// Halaman login & registrasi hanya untuk tamu.
// Pengguna yang sudah login dikirim ke halaman yang tadi diminta (state.from),
// atau ke halaman awal perannya. Ini juga yang mengarahkan pengguna setelah login berhasil.
function GuestRoute() {
  const { status, user } = useAuth()
  const location = useLocation()

  if (status === 'checking') return <FullPageLoader />
  if (user) return <Navigate to={location.state?.from ?? homePathFor(user)} replace />

  return <Outlet />
}

export default GuestRoute
