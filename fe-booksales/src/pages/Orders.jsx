import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Alert from '../components/Alert.jsx'
import PaymentBadge from '../components/PaymentBadge.jsx'
import SiteHeader from '../components/store/SiteHeader.jsx'
import { api } from '../lib/api.js'
import { formatDate, formatRupiah } from '../lib/format.js'
import { useToast } from '../toast/useToast.js'

// Riwayat pesanan milik customer yang sedang login (GET /api/my-transactions)
function Orders() {
  const location = useLocation()
  const toast = useToast()
  const paidOrder = location.state?.paidOrder
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(null)

  function load() {
    return api
      .getMyTransactions()
      .then((res) => setOrders(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  async function handleCancel(orderId) {
    setCancelling(orderId)
    try {
      await api.cancelCheckout(orderId)
      toast.info('Pesanan dibatalkan', { message: 'Stok buku sudah dikembalikan.' })
      await load()
    } catch (err) {
      toast.error('Gagal membatalkan', { message: err.message })
    } finally {
      setCancelling(null)
    }
  }

  const totalPaid = orders
    .filter((o) => o.payment_status === 'paid')
    .reduce((sum, o) => sum + Number(o.total_amount), 0)

  return (
    <div className="site">
      <SiteHeader />
      <main className="site-inner page">
        <header className="page-header">
          <div>
            <h1>Riwayat pesanan</h1>
            <p className="muted">Total belanja lunas: {formatRupiah(totalPaid)}</p>
          </div>
        </header>

        <Alert>{error}</Alert>

        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>No. pesanan</th>
                <th>Tanggal</th>
                <th>Buku</th>
                <th className="col-num">Jumlah</th>
                <th className="col-money">Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="6" className="empty">Memuat data…</td>
                </tr>
              )}
              {!loading && !error && orders.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty">
                    Belum ada pesanan. <Link to="/">Mulai belanja</Link>.
                  </td>
                </tr>
              )}
              {orders.map((o) => (
                <tr key={o.id} className={paidOrder && o.payment_order_id === paidOrder ? 'row-new' : undefined}>
                  <td className="strong">{o.order_number}</td>
                  <td className="muted">{formatDate(o.created_at)}</td>
                  <td>{o.book?.title ?? '-'}</td>
                  <td className="col-num">{o.quantity}</td>
                  <td className="col-money">{formatRupiah(o.total_amount)}</td>
                  <td>
                    <div className="status-cell">
                      <PaymentBadge status={o.payment_status} />
                      {o.payment_status === 'pending' && o.payment_order_id && (
                        <button
                          type="button"
                          className="btn btn-danger-ghost btn-sm"
                          onClick={() => handleCancel(o.payment_order_id)}
                          disabled={cancelling === o.payment_order_id}
                        >
                          {cancelling === o.payment_order_id ? 'Membatalkan…' : 'Batalkan'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

export default Orders
