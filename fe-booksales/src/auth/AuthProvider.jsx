import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api.js'
import { AuthContext } from './AuthContext.js'
import {
  ROLES,
  clearSession,
  getRole,
  getStoredUser,
  getToken,
  hasRole,
  saveSession,
  saveUser,
} from './authService.js'

// Status sesi:
//   checking -> token ada, peran sedang dicek ulang ke server
//   ready    -> sesi sudah pasti (login atau tidak)
function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (getToken() ? getStoredUser() : null))
  const [status, setStatus] = useState(() => (getToken() ? 'checking' : 'ready'))

  const logoutLocal = useCallback(() => {
    clearSession()
    setUser(null)
    setStatus('ready')
  }, [])

  // Data user di localStorage bisa diubah lewat DevTools, jadi peran diambil ulang
  // dari backend (GET /api/me) setiap aplikasi dibuka.
  useEffect(() => {
    if (!getToken()) return
    let cancelled = false
    api
      .me()
      .then((res) => {
        if (cancelled) return
        saveUser(res.data)
        setUser(res.data)
        setStatus('ready')
      })
      .catch((err) => {
        if (cancelled) return
        if (err.status === 401) {
          logoutLocal()
        } else {
          // Server tidak bisa dihubungi: pakai data tersimpan, backend tetap memeriksa tiap request
          setStatus('ready')
        }
      })
    return () => {
      cancelled = true
    }
  }, [logoutLocal])

  // Token kedaluwarsa di tengah pemakaian (dikirim oleh api.js) atau logout di tab lain
  useEffect(() => {
    function handleStorage(e) {
      if (e.key === null || e.key === 'token' || e.key === 'user') {
        setUser(getToken() ? getStoredUser() : null)
      }
    }
    window.addEventListener('auth:expired', logoutLocal)
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('auth:expired', logoutLocal)
      window.removeEventListener('storage', handleStorage)
    }
  }, [logoutLocal])

  const login = useCallback(async (credentials) => {
    const res = await api.login(credentials)
    saveSession(res.token, res.user)
    setUser(res.user)
    setStatus('ready')
    return res.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.logout()
    } catch {
      // Token mungkin sudah kedaluwarsa; sesi lokal tetap dihapus
    }
    logoutLocal()
  }, [logoutLocal])

  const value = useMemo(() => {
    const role = getRole(user)
    return {
      user,
      role,
      status,
      isAuthenticated: Boolean(user),
      isAdmin: role === ROLES.ADMIN,
      hasRole: (allowedRoles) => hasRole(user, allowedRoles),
      login,
      logout,
    }
  }, [user, status, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
