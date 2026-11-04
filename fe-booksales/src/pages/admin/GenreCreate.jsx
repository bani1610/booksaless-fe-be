import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Alert from '../../components/Alert.jsx'
import { api } from '../../lib/api.js'

function GenreCreate() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', description: '' })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErrors({})
    setMessage('')
    setSaving(true)
    try {
      const res = await api.createGenre(form)
      navigate('/admin/genres', {
        state: { success: `Genre "${res.data.name}" berhasil ditambahkan.` },
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
          <Link to="/admin/genres" className="back-link">← Kembali ke daftar genre</Link>
          <h1>Tambah genre</h1>
        </div>
      </header>

      <form className="card form" onSubmit={handleSubmit}>
        <Alert>{message}</Alert>
        <label className="field">
          <span>Nama genre</span>
          <input
            type="text"
            required
            maxLength={255}
            placeholder="Contoh: Fiksi Ilmiah"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          {errors.name && <small className="field-error">{errors.name[0]}</small>}
        </label>
        <label className="field">
          <span>Deskripsi</span>
          <textarea
            rows="4"
            required
            placeholder="Jelaskan singkat genre ini"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          {errors.description && <small className="field-error">{errors.description[0]}</small>}
        </label>
        <div className="form-actions">
          <Link to="/admin/genres" className="btn btn-ghost">Batal</Link>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Menyimpan…' : 'Simpan genre'}
          </button>
        </div>
      </form>
    </>
  )
}

export default GenreCreate
