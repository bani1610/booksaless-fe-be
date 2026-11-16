import { useEffect, useRef } from 'react'
import { formatRupiah } from '../lib/format.js'

// Modal berisi halaman pembayaran hosted Durianpay. Hasil pembayaran tidak bisa dibaca dari iframe
// (beda domain), jadi halaman Keranjang yang mengecek status ke backend secara berkala.
function PaymentModal({ open, url, amount, busy, onCheck, onClose }) {
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
      className="dialog pay-dialog"
      aria-labelledby="pay-title"
      onCancel={(e) => {
        // Tombol Esc: lewati onClose agar pembatalan selalu lewat alur yang sama
        e.preventDefault()
        if (!busy) onClose()
      }}
    >
      <header className="pay-dialog-head">
        <div>
          <h2 id="pay-title">Pembayaran</h2>
          <p className="muted small">Durianpay · mode sandbox · total {formatRupiah(amount)}</p>
        </div>
        <button type="button" className="toast-close" onClick={onClose} disabled={busy} aria-label="Tutup pembayaran">
          ×
        </button>
      </header>

      {open && <iframe className="pay-frame" src={url} title="Halaman pembayaran Durianpay" />}

      <footer className="pay-dialog-foot">
        <p className="muted small pay-hint">
          <span className="spinner" aria-hidden="true" />
          Menunggu konfirmasi pembayaran… halaman ini akan menutup otomatis setelah lunas.
        </p>
        <div className="row-actions">
          <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
            Buka di tab baru
          </a>
          <button type="button" className="btn btn-primary btn-sm" onClick={onCheck} disabled={busy}>
            {busy ? 'Memeriksa…' : 'Saya sudah bayar'}
          </button>
        </div>
      </footer>
    </dialog>
  )
}

export default PaymentModal
