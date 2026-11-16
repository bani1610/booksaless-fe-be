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

// Payload berisi File dikirim sebagai multipart. PHP tidak membaca multipart pada PUT,
// jadi ubah data dikirim sebagai POST + _method=PUT (method spoofing Laravel).
function save(url, payload, isUpdate) {
  const hasFile = Object.values(payload).some((v) => v instanceof File)
  if (!hasFile) return isUpdate ? http.put(url, payload) : http.post(url, payload)

  const body = new FormData()
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== null && value !== undefined) body.append(key, value)
  })
  if (isUpdate) body.append('_method', 'PUT')
  return http.post(url, body)
}

export const api = {
  register: (payload) => http.post('/register', payload),
  login: (credentials) => http.post('/login', credentials),
  logout: () => http.post('/logout'),
  me: () => http.get('/me'),

  getBooks: () => http.get('/books'),
  getBook: (id) => http.get(`/books/${id}`),
  createBook: (payload) => save('/books', payload, false),
  updateBook: (id, payload) => save(`/books/${id}`, payload, true),
  deleteBook: (id) => http.delete(`/books/${id}`),

  // Customer
  createTransaction: (payload) => http.post('/transactions', payload),
  getMyTransactions: () => http.get('/my-transactions'),
  checkout: (items) => http.post('/checkout', { items }),
  checkoutStatus: (orderId) => http.get(`/checkout/${orderId}/status`),
  cancelCheckout: (orderId) => http.post('/checkout/cancel', { order_id: orderId }),

  // Admin
  getTransactions: () => http.get('/transactions'),
  deleteTransaction: (id) => http.delete(`/transactions/${id}`),

  getGenres: () => http.get('/genres'),
  getGenre: (id) => http.get(`/genres/${id}`),
  createGenre: (payload) => http.post('/genres', payload),
  updateGenre: (id, payload) => http.put(`/genres/${id}`, payload),
  deleteGenre: (id) => http.delete(`/genres/${id}`),

  getAuthors: (search = '') => http.get('/authors', { params: search ? { search } : {} }),
  getAuthor: (id) => http.get(`/authors/${id}`),
  createAuthor: (payload) => save('/authors', payload, false),
  updateAuthor: (id, payload) => save(`/authors/${id}`, payload, true),
  deleteAuthor: (id) => http.delete(`/authors/${id}`),

  getUsers: () => http.get('/users'),
  getUser: (id) => http.get(`/users/${id}`),
  createUser: (payload) => http.post('/users', payload),
  updateUser: (id, payload) => http.put(`/users/${id}`, payload),
  deleteUser: (id) => http.delete(`/users/${id}`),
}
