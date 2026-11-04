import { Navigate } from 'react-router-dom'
import { getToken, getUser } from '../lib/api.js'

function RequireAdmin({ children }) {
  const user = getUser()
  if (!getToken() || !user?.is_admin) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default RequireAdmin
