import { Navigate } from 'react-router-dom'
import { getToken, getUser } from '../lib/api.js'

function RequireAdmin({ children }) {
  if (!getToken()) return <Navigate to="/login" replace />
  // Customer yang sudah login diarahkan ke halaman akunnya, bukan ke login lagi
  if (!getUser()?.is_admin) return <Navigate to="/akun" replace />
  return children
}

export default RequireAdmin
