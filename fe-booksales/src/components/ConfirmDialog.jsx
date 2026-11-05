import { useEffect, useRef } from 'react'

// Dialog konfirmasi berbasis <dialog> bawaan browser: fokus terkunci di dalam
// dialog dan tombol Esc menutupnya tanpa perlu library tambahan.
function ConfirmDialog({ open, title, children, confirmLabel = 'Hapus', busy, error, onConfirm, onCancel }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby="confirm-title"
      onCancel={(e) => {
        e.preventDefault()
        if (!busy) onCancel()
      }}
    >
      <h2 id="confirm-title">{title}</h2>
      <div className="dialog-body">{children}</div>
      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}
      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy} autoFocus>
          Batal
        </button>
        <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={busy}>
          {busy ? 'Menghapus…' : confirmLabel}
        </button>
      </div>
    </dialog>
  )
}

export default ConfirmDialog
