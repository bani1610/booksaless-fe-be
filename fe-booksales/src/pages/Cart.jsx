import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PaymentModal from '../components/PaymentModal.jsx'
import BookCover from '../components/store/BookCover.jsx'
import SiteHeader from '../components/store/SiteHeader.jsx'
import { useCart } from '../cart/useCart.js'
import { api } from '../lib/api.js'
import { formatRupiah } from '../lib/format.js'
import { useToast } from '../toast/useToast.js'

const POLL_MS = 3000

// Tahapan checkout yang ditampilkan ke pengguna
const PHASE_TEXT = {
  preparing: 'Menyiapkan pembayaran…',
  paying: 'Selesaikan pembayaran di jendela Durianpay.',
  closing: 'Memeriksa status pembayaran…',
}

function Cart() {
  const navigate = useNavigate()
  const toast = useToast()
  const { items, count, total, setQuantity, removeItem, clear } = useCart()
  const [phase, setPhase] = useState('idle')
  const [payment, setPayment] = useState(null) // { orderId, url, amount }
  const [checking, setChecking] = useState(false)
  const inFlight = useRef(false)
  const busy = phase !== 'idle'

  const finishPaid = useCallback(
    (pay, books) => {
      setPhase('idle')
      setPayment(null)
      clear()
      toast.success('Pembayaran berhasil', {
        message: `${books} buku · ${formatRupiah(pay.amount)}. Terima kasih sudah berbelanja!`,
      })
      navigate('/pesanan', { state: { paidOrder: pay.orderId } })
    },
    [clear, navigate, toast],
  )

  // Satu pengecekan status ke backend; mengembalikan 'pending' | 'paid' | 'cancelled' | null (gagal)
  const checkStatus = useCallback(async (pay) => {
    if (inFlight.current) return null
    inFlight.current = true
    try {
      const res = await api.checkoutStatus(pay.orderId)
      return res.data.status
    } catch {
      return null
    } finally {
      inFlight.current = false
    }
  }, [])

  // Selama modal terbuka, cek status berkala agar modal menutup sendiri setelah lunas
  useEffect(() => {
    if (phase !== 'paying' || !payment) return
    const books = count
    const timer = setInterval(async () => {
      const status = await checkStatus(payment)
      if (status === 'paid') finishPaid(payment, books)
    }, POLL_MS)
    return () => clearInterval(timer)
  }, [phase, payment, count, checkStatus, finishPaid])

  async function handleCheckout() {
    setPhase('preparing')
    try {
      const res = await api.checkout(items.map((i) => ({ book_id: i.id, quantity: i.quantity })))
      setPayment({ orderId: res.data.order_id, url: res.data.payment_url, amount: res.data.amount })
      setPhase('paying')
    } catch (err) {
      setPhase('idle')
      toast.error('Checkout gagal', { message: err.message })
    }
  }

  async function handleManualCheck() {
    setChecking(true)
    const status = await checkStatus(payment)
    setChecking(false)
    if (status === 'paid') finishPaid(payment, count)
    else if (status === 'pending') toast.info('Pembayaran belum diterima', { message: 'Selesaikan pembayaran di jendela Durianpay, lalu cek lagi.' })
    else if (status === null) toast.error('Gagal memeriksa status', { message: 'Coba beberapa detik lagi.' })
  }

  // Modal ditutup: cek sekali lagi, bila belum lunas pesanan dibatalkan dan stok dikembalikan
  async function handleClose() {
    const pay = payment
    setPhase('closing')
    const status = await checkStatus(pay)
    if (status === 'paid') {
      finishPaid(pay, count)
      return
    }
    try {
      await api.cancelCheckout(pay.orderId)
      toast.info('Pembayaran dibatalkan', { message: 'Stok dikembalikan dan keranjang Anda tetap tersimpan.' })
    } catch (err) {
      toast.error('Pesanan belum dibatalkan', { message: `${err.message} Anda bisa membatalkannya dari riwayat pesanan.` })
    }
    setPayment(null)
    setPhase('idle')
  }

  function handleRemove(item) {
    removeItem(item.id)
    toast.info(`"${item.title}" dihapus dari keranjang`)
  }

  return (
    <div className="site">
      <SiteHeader />
      <main className="site-inner page">
        <header className="page-header">
          <div>
            <h1>Keranjang</h1>
            <p className="muted">Periksa jumlah buku sebelum membayar.</p>
          </div>
        </header>

        {items.length === 0 ? (
          <div className="card empty fade-in">
            <p>Keranjang masih kosong.</p>
            <Link to="/" className="btn btn-primary btn-sm">
              Pilih buku di katalog
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <ul className="cart-list">
              {items.map((item, i) => (
                <li key={item.id} className="card cart-item fade-in" style={{ '--i': i }}>
                  <BookCover book={item} />
                  <div className="cart-info">
                    <h3>{item.title}</h3>
                    <p className="muted">{item.author?.name}</p>
                    <p className="strong">{formatRupiah(item.price)}</p>
                  </div>
                  <div className="cart-controls">
                    <div className="qty" role="group" aria-label={`Jumlah ${item.title}`}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setQuantity(item.id, item.quantity - 1)}
                        disabled={busy || item.quantity <= 1}
                        aria-label="Kurangi"
                      >
                        −
                      </button>
                      <span key={item.quantity} className="bump" aria-live="polite">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setQuantity(item.id, item.quantity + 1)}
                        disabled={busy || item.quantity >= item.stock}
                        aria-label="Tambah"
                      >
                        +
                      </button>
                    </div>
                    <p className="strong">{formatRupiah(item.price * item.quantity)}</p>
                    <button
                      type="button"
                      className="btn btn-danger-ghost btn-sm"
                      onClick={() => handleRemove(item)}
                      disabled={busy}
                    >
                      Hapus
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="card cart-summary">
              <h2>Ringkasan</h2>
              <dl>
                <div>
                  <dt>Jumlah buku</dt>
                  <dd>{count}</dd>
                </div>
                <div>
                  <dt>Total</dt>
                  <dd key={total} className="strong bump">{formatRupiah(total)}</dd>
                </div>
              </dl>

              {busy ? (
                <div className="pay-status" role="status">
                  <span className="spinner" aria-hidden="true" />
                  <p>{PHASE_TEXT[phase]}</p>
                </div>
              ) : (
                <button type="button" className="btn btn-primary btn-block" onClick={handleCheckout}>
                  Bayar sekarang
                </button>
              )}
              <p className="muted small">
                Pembayaran diproses oleh Durianpay (mode sandbox). Stok dicek ulang oleh server.
              </p>
            </aside>
          </div>
        )}
      </main>

      <PaymentModal
        open={phase === 'paying' || phase === 'closing'}
        url={payment?.url}
        amount={payment?.amount}
        busy={checking || phase === 'closing'}
        onCheck={handleManualCheck}
        onClose={handleClose}
      />
    </div>
  )
}

export default Cart
