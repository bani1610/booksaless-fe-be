import axios from 'axios'
import { getToken } from '../auth/authService.js'

// Instance axios untuk semua request ke backend Laravel (/api diteruskan oleh proxy Vite)
const http = axios.create({
  baseURL: '/api',
  headers: { Accept: 'application/json' },
})

// Interceptor request: sisipkan token JWT jika pengguna sudah login
http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Interceptor response: kembalikan body JSON saja, dan seragamkan bentuk error
http.interceptors.response.use(
  (response) => response.data,
  (err) => {
    const status = err.response?.status
    const data = err.response?.data ?? {}

    // Token ditolak server saat sesi berjalan: AuthProvider akan menghapus sesi lokal
    if (status === 401 && err.config?.headers?.Authorization) {
      window.dispatchEvent(new Event('auth:expired'))
    }

    const error = new Error(
      data.message || (status ? `Request gagal (${status})` : 'Server tidak dapat dihubungi'),
    )
    error.status = status
    error.errors = data.errors || {}
    return Promise.reject(error)
  },
)

export const api = {
  register: (payload) => http.post('/register', payload),
  login: (credentials) => http.post('/login', credentials),
  logout: () => http.post('/logout'),
  me: () => http.get('/me'),

  getBooks: () => http.get('/books'),

  getGenres: () => http.get('/genres'),
  getGenre: (id) => http.get(`/genres/${id}`),
  createGenre: (payload) => http.post('/genres', payload),
  updateGenre: (id, payload) => http.put(`/genres/${id}`, payload),
  deleteGenre: (id) => http.delete(`/genres/${id}`),

  getAuthors: (search = '') => http.get('/authors', { params: search ? { search } : {} }),
  getAuthor: (id) => http.get(`/authors/${id}`),
  createAuthor: (payload) => http.post('/authors', payload),
  updateAuthor: (id, payload) => http.put(`/authors/${id}`, payload),
  deleteAuthor: (id) => http.delete(`/authors/${id}`),
}
