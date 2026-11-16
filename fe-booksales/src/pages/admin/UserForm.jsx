import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Alert from '../../components/Alert.jsx'
import PasswordField from '../../components/form/PasswordField.jsx'
import TextField from '../../components/form/TextField.jsx'
import { useAuth } from '../../auth/useAuth.js'
import { api } from '../../lib/api.js'

const EMPTY = { name: '', username: '', email: '', password: '', is_admin: false }

// Satu form untuk tambah (/admin/users/create) dan ubah (/admin/users/:id/edit)
function UserForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { user: me } = useAuth()
  const isMe = isEdit && Number(id) === me?.id
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)

  useEffect(() => {
    if (!isEdit) return
    let ignore = false
    api
      .getUser(id)
      .then((res) => {
        if (ignore) return
        const u = res.data
        setForm({ name: u.name, username: u.username ?? '', email: u.email, password: '', is_admin: u.is_admin })
      })
      .catch((err) => !ignore && setMessage(err.message))
      .finally(() => !ignore && setLoading(false))
    return () => {
      ignore = true
    }
  }, [id, isEdit])

  function set(field) {
    return (e) => setForm({ ...form, [field]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrors({})
    setMessage('')
    setSaving(true)
    try {
      const res = isEdit ? await api.updateUser(id, form) : await api.createUser(form)
      navigate('/admin/users', {
        state: {
          success: isEdit
            ? `Akun "${res.data.name}" berhasil diperbarui.`
            : `Akun "${res.data.name}" berhasil ditambahkan.`,
        },
      })
    } catch (err) {
      setErrors(err.errors || {})
      setMessage(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <header className="page-header">
        <div>
          <Link to="/admin/users" className="back-link">← Kembali ke daftar akun</Link>
          <h1>{isEdit ? 'Ubah akun' : 'Tambah akun'}</h1>
        </div>
      </header>

      {loading ? (
        <p className="muted">Memuat data akun…</p>
      ) : (
        <form className="card form" onSubmit={handleSubmit}>
          <Alert>{message}</Alert>
          <TextField
            label="Nama lengkap"
            required
            minLength={3}
            maxLength={255}
            value={form.name}
            onChange={set('name')}
            error={errors.name?.[0]}
          />
          <div className="field-row">
            <TextField
              label="Username"
              required
              minLength={4}
              maxLength={30}
              pattern="[a-z0-9_.]+"
              hint="Huruf kecil, angka, titik, garis bawah."
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })}
              error={errors.username?.[0]}
            />
            <TextField
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={set('email')}
              error={errors.email?.[0]}
            />
          </div>
          <PasswordField
            label={isEdit ? 'Password baru' : 'Password'}
            required={!isEdit}
            minLength={8}
            autoComplete="new-password"
            hint={isEdit ? 'Kosongkan bila tidak ingin mengganti password.' : 'Minimal 8 karakter.'}
            value={form.password}
            onChange={set('password')}
            error={errors.password?.[0]}
          />
          <label className="field">
            <span>Peran</span>
            <select
              value={form.is_admin ? 'admin' : 'customer'}
              onChange={(e) => setForm({ ...form, is_admin: e.target.value === 'admin' })}
              disabled={isMe}
            >
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
            {isMe && <small className="field-hint">Anda tidak dapat mengubah peran akun Anda sendiri.</small>}
            {errors.is_admin && <small className="field-error">{errors.is_admin[0]}</small>}
          </label>
          <div className="form-actions">
            <Link to="/admin/users" className="btn btn-ghost">Batal</Link>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Menyimpan…' : isEdit ? 'Simpan perubahan' : 'Simpan akun'}
            </button>
          </div>
        </form>
      )}
    </>
  )
}

export default UserForm
