const BASE_URL = '/api'

export function getToken() {
  return localStorage.getItem('token')
}

export function getUser() {
  const raw = localStorage.getItem('user')
  return raw ? JSON.parse(raw) : null
}

export function saveSession(token, user) {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (body) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const error = new Error(data.message || `Request gagal (${res.status})`)
    error.status = res.status
    error.errors = data.errors || {}
    throw error
  }
  return data
}

export const api = {
  login: (credentials) => request('/login', { method: 'POST', body: credentials }),
  logout: () => request('/logout', { method: 'POST' }),

  getGenres: () => request('/genres'),
  createGenre: (payload) => request('/genres', { method: 'POST', body: payload }),

  getAuthors: (search = '') =>
    request(`/authors${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  createAuthor: (payload) => request('/authors', { method: 'POST', body: payload }),
}
