import { useEffect, useId, useMemo, useState } from 'react'

const MAX_BYTES = 2 * 1024 * 1024 // sama dengan batas di backend (max:2048 KB)
const ACCEPT = 'image/jpeg,image/png,image/webp'
const isLink = (value) => /^https?:\/\//.test(value ?? '')

// Foto bisa diunggah dari perangkat ATAU memakai link gambar. Saat disimpan, file menggantikan link.
function PhotoField({ label, url, file, onUrlChange, onFileChange, error, shape = 'cover' }) {
  const id = useId()
  // Mulai di mode link bila data lama sudah berupa link, selain itu mode unggah
  const [mode, setMode] = useState(() => (isLink(url) ? 'link' : 'upload'))
  const [fileError, setFileError] = useState('')
  const [dragging, setDragging] = useState(false)
  const [brokenSrc, setBrokenSrc] = useState(null)
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview])

  function pick(picked) {
    if (!picked) return
    if (!ACCEPT.split(',').includes(picked.type)) {
      setFileError('Format harus JPG, PNG, atau WEBP.')
      return
    }
    if (picked.size > MAX_BYTES) {
      setFileError('Ukuran file maksimal 2 MB.')
      return
    }
    setFileError('')
    onFileChange(picked)
  }

  function switchMode(next) {
    setMode(next)
    setFileError('')
    // Pindah ke link: file yang belum tersimpan dibatalkan agar tidak menimpa link
    if (next === 'link') onFileChange(null)
  }

  const src = preview ?? (isLink(url) ? url : null)
  const broken = src && brokenSrc === src
  const legacyValue = url && !isLink(url) && !file // mis. "bumi.jpg" dari data seeder
  const shownError = fileError || error

  return (
    <div className={`field photo-field${shownError ? ' has-error' : ''}`}>
      <span>{label}</span>
      <div className="photo-row">
        <div className={`photo-preview photo-${shape}`}>
          {src && !broken ? (
            <img src={src} alt="Pratinjau foto" onError={() => setBrokenSrc(src)} />
          ) : (
            <span className="muted small">{broken ? 'Gambar tidak dapat dimuat' : 'Belum ada foto'}</span>
          )}
        </div>

        <div className="photo-inputs">
          <div className="segmented" role="group" aria-label={`Sumber ${label}`}>
            <button type="button" aria-pressed={mode === 'upload'} onClick={() => switchMode('upload')}>
              Unggah gambar
            </button>
            <button type="button" aria-pressed={mode === 'link'} onClick={() => switchMode('link')}>
              Pakai link
            </button>
          </div>

          {mode === 'upload' ? (
            file ? (
              <div className="photo-chosen">
                <span>
                  <span className="strong">{file.name}</span>{' '}
                  <span className="muted">({Math.ceil(file.size / 1024)} KB)</span>
                </span>
                <button type="button" className="btn btn-danger-ghost btn-sm" onClick={() => onFileChange(null)}>
                  Batal
                </button>
              </div>
            ) : (
              <label
                htmlFor={`${id}-file`}
                className={`dropzone${dragging ? ' dragging' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragging(false)
                  pick(e.dataTransfer.files?.[0])
                }}
              >
                <input
                  id={`${id}-file`}
                  className="sr-only"
                  type="file"
                  accept={ACCEPT}
                  onChange={(e) => {
                    pick(e.target.files?.[0])
                    e.target.value = '' // agar file yang sama bisa dipilih lagi
                  }}
                />
                <span className="strong">Klik untuk memilih gambar</span>
                <span className="muted small">atau seret file ke sini · JPG, PNG, WEBP, maks. 2 MB</span>
              </label>
            )
          ) : (
            <input
              type="url"
              aria-label={`${label}: link gambar`}
              placeholder="https://contoh.com/gambar.jpg"
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
            />
          )}

          {legacyValue && (
            <small className="field-hint">
              Data saat ini “{url}” bukan link gambar, jadi tidak bisa ditampilkan. Unggah gambar atau ganti dengan link.
            </small>
          )}
          {mode === 'link' && broken && !legacyValue && (
            <small className="field-hint">Link tidak bisa dimuat sebagai gambar. Pastikan link mengarah langsung ke file gambar.</small>
          )}
          {shownError && <small className="field-error">{shownError}</small>}
        </div>
      </div>
    </div>
  )
}

export default PhotoField
