import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ToastContext } from './ToastContext.js'

const DURATION = 4000
const EXIT_MS = 250
const MAX_VISIBLE = 3

const ICONS = {
  success: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  error: <path d="M12 7v6m0 4h.01" />,
  info: <path d="M12 11v6m0-10h.01" />,
}

// Notifikasi singkat di pojok layar: memberi tahu pengguna hasil setiap aksi
// (masuk keranjang, pembayaran berhasil/gagal, dsb.) tanpa memindahkan halaman.
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())
  const nextId = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t)))
    timers.current.set(
      `${id}-exit`,
      setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), EXIT_MS),
    )
  }, [])

  const show = useCallback(
    (type, title, { message, action, duration = DURATION } = {}) => {
      const id = ++nextId.current
      setToasts((list) => [...list.slice(-(MAX_VISIBLE - 1)), { id, type, title, message, action }])
      timers.current.set(id, setTimeout(() => dismiss(id), duration))
      return id
    },
    [dismiss],
  )

  useEffect(() => {
    const map = timers.current
    return () => map.forEach(clearTimeout)
  }, [])

  const value = useMemo(
    () => ({
      success: (title, opts) => show('success', title, opts),
      error: (title, opts) => show('error', title, { duration: 6000, ...opts }),
      info: (title, opts) => show('info', title, opts),
      dismiss,
    }),
    [show, dismiss],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}${t.leaving ? ' leaving' : ''}`}>
            <svg className="toast-icon" viewBox="0 0 24 24" aria-hidden="true">
              {ICONS[t.type]}
            </svg>
            <div className="toast-body">
              <p className="toast-title">{t.title}</p>
              {t.message && <p className="toast-message">{t.message}</p>}
              {t.action && (
                <Link to={t.action.to} className="toast-action" onClick={() => dismiss(t.id)}>
                  {t.action.label}
                </Link>
              )}
            </div>
            <button type="button" className="toast-close" onClick={() => dismiss(t.id)} aria-label="Tutup notifikasi">
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export default ToastProvider
