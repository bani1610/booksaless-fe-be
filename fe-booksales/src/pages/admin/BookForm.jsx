import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Alert from '../../components/Alert.jsx'
import PhotoField from '../../components/form/PhotoField.jsx'
import { api } from '../../lib/api.js'

const EMPTY = { title: '', description: '', price: '', stock: '', cover_photo: '', genre_id: '', author_id: '' }

// Satu form untuk tambah (/admin/books/create) dan ubah (/admin/books/:id/edit)
function BookForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [coverFile, setCoverFile] = useState(null)
  const [genres, setGenres] = useState([])
  const [authors, setAuthors] = useState([])
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    // Pilihan genre dan author dimuat bersama data buku (saat ubah)
    Promise.all([api.getGenres(), api.getAuthors(), isEdit ? api.getBook(id) : null])
      .then(([genreRes, authorRes, bookRes]) => {
        if (ignore) return
        setGenres(genreRes.data)
        setAuthors(authorRes.data)
        if (bookRes) {
          const b = bookRes.data
          setForm({
            title: b.title,
            description: b.description ?? '',
            price: String(Number(b.price)),
            stock: String(b.stock),
            cover_photo: b.cover_photo ?? '',
            genre_id: String(b.genre_id),
            author_id: String(b.author_id),
          })
        }
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
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      genre_id: Number(form.genre_id),
      author_id: Number(form.author_id),
      cover_photo_file: coverFile,
    }
    try {
      const res = isEdit ? await api.updateBook(id, payload) : await api.createBook(payload)
      navigate('/admin/books', {
        state: {
          success: isEdit
            ? `Buku "${res.data.title}" berhasil diperbarui.`
            : `Buku "${res.data.title}" berhasil ditambahkan.`,
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
          <Link to="/admin/books" className="back-link">← Kembali ke daftar buku</Link>
          <h1>{isEdit ? 'Ubah buku' : 'Tambah buku'}</h1>
        </div>
      </header>

      {loading ? (
        <p className="muted">Memuat data…</p>
      ) : (
        <form className="card form" onSubmit={handleSubmit}>
          <Alert>{message}</Alert>
          <label className="field">
            <span>Judul</span>
            <input type="text" required maxLength={255} placeholder="Contoh: Laskar Pelangi" value={form.title} onChange={set('title')} />
            {errors.title && <small className="field-error">{errors.title[0]}</small>}
          </label>
          <div className="field-row">
            <label className="field">
              <span>Genre</span>
              <select required value={form.genre_id} onChange={set('genre_id')}>
                <option value="">Pilih genre</option>
                {genres.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
              {errors.genre_id && <small className="field-error">{errors.genre_id[0]}</small>}
            </label>
            <label className="field">
              <span>Author</span>
              <select required value={form.author_id} onChange={set('author_id')}>
                <option value="">Pilih author</option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              {errors.author_id && <small className="field-error">{errors.author_id[0]}</small>}
            </label>
          </div>
          <div className="field-row">
            <label className="field">
              <span>Harga (Rp)</span>
              <input type="number" required min="0" step="500" placeholder="85000" value={form.price} onChange={set('price')} />
              {errors.price && <small className="field-error">{errors.price[0]}</small>}
            </label>
            <label className="field">
              <span>Stok</span>
              <input type="number" required min="0" step="1" placeholder="10" value={form.stock} onChange={set('stock')} />
              {errors.stock && <small className="field-error">{errors.stock[0]}</small>}
            </label>
          </div>
          <PhotoField
            label="Sampul (opsional)"
            url={form.cover_photo}
            file={coverFile}
            onUrlChange={(cover_photo) => setForm({ ...form, cover_photo })}
            onFileChange={setCoverFile}
            error={errors.cover_photo_file?.[0] ?? errors.cover_photo?.[0]}
          />
          <label className="field">
            <span>Deskripsi</span>
            <textarea rows="4" placeholder="Sinopsis singkat" value={form.description} onChange={set('description')} />
            {errors.description && <small className="field-error">{errors.description[0]}</small>}
          </label>
          <div className="form-actions">
            <Link to="/admin/books" className="btn btn-ghost">Batal</Link>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Menyimpan…' : isEdit ? 'Simpan perubahan' : 'Simpan buku'}
            </button>
          </div>
        </form>
      )}
    </>
  )
}

export default BookForm
