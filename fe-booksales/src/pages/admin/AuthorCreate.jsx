import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Alert from '../../components/Alert.jsx'
import { api } from '../../lib/api.js'

function AuthorCreate() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', photo: '', bio: '' })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErrors({})
    setMessage('')
    setSaving(true)
    try {
      const res = await api.createAuthor(form)
      navigate('/admin/authors', {
        state: { success: `Author "${res.data.name}" berhasil ditambahkan.` },
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
          <Link to="/admin/authors" className="back-link">← Kembali ke daftar author</Link>
          <h1>Tambah author</h1>
        </div>
      </header>

      <form className="card form" onSubmit={handleSubmit}>
        <Alert>{message}</Alert>
        <label className="field">
          <span>Nama author</span>
          <input
            type="text"
            required
            maxLength={255}
            placeholder="Contoh: Tere Liye"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          {errors.name && <small className="field-error">{errors.name[0]}</small>}
        </label>
        <label className="field">
          <span>Foto</span>
          <input
            type="text"
            required
            placeholder="URL foto, contoh: https://…/foto.jpg"
            value={form.photo}
            onChange={(e) => setForm({ ...form, photo: e.target.value })}
          />
          {errors.photo && <small className="field-error">{errors.photo[0]}</small>}
        </label>
        <label className="field">
          <span>Bio</span>
          <textarea
            rows="4"
            required
            placeholder="Profil singkat author"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
          {errors.bio && <small className="field-error">{errors.bio[0]}</small>}
        </label>
        <div className="form-actions">
          <Link to="/admin/authors" className="btn btn-ghost">Batal</Link>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Menyimpan…' : 'Simpan author'}
          </button>
        </div>
      </form>
    </>
  )
}

export default AuthorCreate
