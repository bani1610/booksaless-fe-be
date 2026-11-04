import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from '../components/Alert.jsx'
import { api, saveSession } from '../lib/api.js'

function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.login(form)
      if (!res.user?.is_admin) {
        setError('Akun ini bukan admin.')
        return
      }
      saveSession(res.token, res.user)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <form className="card login-card" onSubmit={handleSubmit}>
        <div className="brand">
          <span className="brand-mark">B</span>
          <span>Booksales Admin</span>
        </div>
        <h1>Masuk</h1>
        <p className="muted">Gunakan akun admin untuk mengelola data.</p>
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
      </form>
    </div>
  )
}

export default Login
