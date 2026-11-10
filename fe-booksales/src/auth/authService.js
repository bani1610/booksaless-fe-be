// Service otorisasi: satu-satunya tempat yang membaca/menulis sesi di localStorage
// dan menentukan peran (role) pengguna. Komponen lain memakai fungsi-fungsi ini.

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
}

// Halaman awal setiap peran setelah login
const HOME_PATH = {
  [ROLES.ADMIN]: '/admin',
  [ROLES.USER]: '/akun',
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) ?? null
  } catch {
    // Data rusak/diubah manual dianggap tidak ada
    return null
  }
}

export function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

// Backend menandai admin dengan kolom is_admin; di frontend dipetakan ke nama peran
export function getRole(user) {
  if (!user) return null
  return user.is_admin ? ROLES.ADMIN : ROLES.USER
}

// allowedRoles kosong berarti cukup login, peran apa pun boleh
export function hasRole(user, allowedRoles = []) {
  const role = getRole(user)
  if (!role) return false
  return allowedRoles.length === 0 || allowedRoles.includes(role)
}

export function homePathFor(user) {
  return HOME_PATH[getRole(user)] ?? '/'
}
