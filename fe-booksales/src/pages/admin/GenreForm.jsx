import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Alert from '../../components/Alert.jsx'
import { api } from '../../lib/api.js'

// Satu form untuk tambah (/admin/genres/create) dan ubah (/admin/genres/:id/edit)
function GenreForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', description: '' })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)

  useEffect(() => {
    if (!isEdit) return
    // Abaikan respons yang datang setelah komponen berganti/unmount, supaya
    // respons lama tidak menimpa isian form yang sedang diketik admin.
    let ignore = false
    api
      .getGenre(id)
      .then((res) => {
        if (!ignore) setForm({ name: res.data.name, description: res.data.description ?? '' })
      })
      .catch((err) => !ignore && setMessage(err.message))
      .finally(() => !ignore && setLoading(false))
    return () => {
      ignore = true
    }
  }, [id, isEdit])

  async function handleSubmit(e) {
    e.preventDefault()
    setErrors({})
    setMessage('')
    setSaving(true)
    try {
      const res = isEdit ? await api.updateGenre(id, form) : await api.createGenre(form)
      navigate('/admin/genres', {
        state: {
          success: isEdit
            ? `Genre "${res.data.name}" berhasil diperbarui.`
            : `Genre "${res.data.name}" berhasil ditambahkan.`,
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
          <Link to="/admin/genres" className="back-link">← Kembali ke daftar genre</Link>
          <h1>{isEdit ? 'Ubah genre' : 'Tambah genre'}</h1>
        </div>
      </header>

      {loading ? (
        <p className="muted">Memuat data genre…</p>
      ) : (
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
              {saving ? 'Menyimpan…' : isEdit ? 'Simpan perubahan' : 'Simpan genre'}
            </button>
          </div>
        </form>
      )}
    </>
  )
}

export default GenreForm
