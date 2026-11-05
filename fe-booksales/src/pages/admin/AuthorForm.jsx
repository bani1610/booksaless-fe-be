import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Alert from '../../components/Alert.jsx'
import { api } from '../../lib/api.js'

// Satu form untuk tambah (/admin/authors/create) dan ubah (/admin/authors/:id/edit)
function AuthorForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', photo: '', bio: '' })
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
      .getAuthor(id)
      .then((res) => {
        if (!ignore) {
          setForm({ name: res.data.name, photo: res.data.photo ?? '', bio: res.data.bio ?? '' })
        }
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
      const res = isEdit ? await api.updateAuthor(id, form) : await api.createAuthor(form)
      navigate('/admin/authors', {
        state: {
          success: isEdit
            ? `Author "${res.data.name}" berhasil diperbarui.`
            : `Author "${res.data.name}" berhasil ditambahkan.`,
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
          <Link to="/admin/authors" className="back-link">← Kembali ke daftar author</Link>
          <h1>{isEdit ? 'Ubah author' : 'Tambah author'}</h1>
        </div>
      </header>

      {loading ? (
        <p className="muted">Memuat data author…</p>
      ) : (
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
              {saving ? 'Menyimpan…' : isEdit ? 'Simpan perubahan' : 'Simpan author'}
            </button>
          </div>
        </form>
      )}
    </>
  )
}

export default AuthorForm
