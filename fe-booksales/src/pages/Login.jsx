import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Alert from '../components/Alert.jsx'
import { api, saveSession } from '../lib/api.js'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  // Email terisi otomatis jika datang dari halaman registrasi
  const [form, setForm] = useState({ email: location.state?.email ?? '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.login(form)
      saveSession(res.token, res.user)
      // Admin ke dashboard, customer (termasuk hasil registrasi) ke halaman akun
      navigate(res.user?.is_admin ? '/admin' : '/akun', { replace: true })
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
