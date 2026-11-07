import { Navigate } from 'react-router-dom'
import { getToken } from '../lib/api.js'

// Untuk halaman yang cukup login saja (admin maupun customer)
function RequireAuth({ children }) {
  if (!getToken()) return <Navigate to="/login" replace />
  return children
}

export default RequireAuth
