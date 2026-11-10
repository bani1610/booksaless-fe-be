import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Alert from '../components/Alert.jsx'
import { useAuth } from '../auth/useAuth.js'

function Login() {
  const location = useLocation()
  const { login } = useAuth()
  // Diisi oleh ProtectedRoute saat tamu mencoba membuka halaman terlindungi
  const redirectTo = location.state?.from
  // Email terisi otomatis jika datang dari halaman registrasi
  const [form, setForm] = useState({ email: location.state?.email ?? '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // Setelah sesi tersimpan, GuestRoute mengarahkan pengguna: ke halaman yang tadi
      // diminta, atau ke halaman awal sesuai peran (admin -> /admin, user -> /akun).
      // Jika perannya tidak cocok, ProtectedRoute yang akan mengarahkan ke /403.
      await login(form)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <form className="card login-card" onSubmit={handleSubmit}>
        <Link to="/" className="brand brand-link">
          <span className="brand-mark">B</span>
          <span>Booksales</span>
        </Link>
        <h1>Masuk</h1>
        <p className="muted">Masuk dengan email dan password akun Anda.</p>
        {redirectTo && !error && (
          <Alert type="info">Silakan masuk terlebih dahulu untuk membuka halaman tersebut.</Alert>
        )}
        <Alert>{error}</Alert>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>
        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Memproses…' : 'Masuk'}
        </button>
        <p className="auth-switch">
          Belum punya akun? <Link to="/register">Daftar</Link>
        </p>
      </form>
    </div>
  )
}

export default Login
