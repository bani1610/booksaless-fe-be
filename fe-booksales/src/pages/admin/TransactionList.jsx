import { useEffect, useState } from 'react'
import Alert from '../../components/Alert.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import PaymentBadge from '../../components/PaymentBadge.jsx'
import { api } from '../../lib/api.js'
import { formatDate, formatRupiah } from '../../lib/format.js'

function TransactionList() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [target, setTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    api
      .getTransactions()
      .then((res) => setTransactions(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete() {
    setDeleting(true)
    setDeleteError('')
    try {
      await api.deleteTransaction(target.id)
      setTransactions((list) => list.filter((t) => t.id !== target.id))
      setSuccess(
        target.payment_status === 'cancelled'
          ? `Transaksi ${target.order_number} dihapus.`
          : `Transaksi ${target.order_number} dihapus, stok buku dikembalikan.`,
      )
      setTarget(null)
    } catch (err) {
      setDeleteError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  // Hanya transaksi lunas yang dihitung sebagai penjualan
  const revenue = transactions
    .filter((t) => t.payment_status === 'paid')
    .reduce((sum, t) => sum + Number(t.total_amount), 0)

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Transaksi</h1>
          <p className="muted">
            {transactions.length} transaksi · penjualan lunas {formatRupiah(revenue)}
          </p>
        </div>
      </header>

      <Alert type="success">{success}</Alert>
      <Alert>{error}</Alert>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>No. pesanan</th>
              <th>Tanggal</th>
              <th>Customer</th>
              <th>Buku</th>
              <th className="col-num">Jumlah</th>
              <th className="col-money">Total</th>
              <th>Status</th>
              <th className="col-actions">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="8" className="empty">Memuat data…</td>
              </tr>
            )}
            {!loading && !error && transactions.length === 0 && (
              <tr>
                <td colSpan="8" className="empty">Belum ada transaksi.</td>
              </tr>
            )}
            {transactions.map((t) => (
              <tr key={t.id}>
                <td className="strong">{t.order_number}</td>
                <td className="muted">{formatDate(t.created_at)}</td>
                <td>{t.customer?.name ?? '-'}</td>
                <td>{t.book?.title ?? '-'}</td>
                <td className="col-num">{t.quantity}</td>
                <td className="col-money">{formatRupiah(t.total_amount)}</td>
                <td>
                  <PaymentBadge status={t.payment_status} />
                </td>
                <td className="col-actions">
                  <button
                    type="button"
                    className="btn btn-danger-ghost btn-sm"
                    onClick={() => {
                      setDeleteError('')
                      setTarget(t)
                    }}
                    aria-label={`Hapus transaksi ${t.order_number}`}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={Boolean(target)}
        title="Hapus transaksi?"
        confirmLabel="Ya, hapus transaksi"
        busy={deleting}
        error={deleteError}
        onConfirm={handleDelete}
        onCancel={() => setTarget(null)}
      >
        <p>
          Transaksi <strong>{target?.order_number}</strong> akan dihapus
          {target?.payment_status === 'cancelled' ? (
            '. Stoknya sudah dikembalikan saat dibatalkan.'
          ) : (
            <>
              {' '}dan {target?.quantity} stok buku <strong>{target?.book?.title}</strong> dikembalikan.
            </>
          )}
        </p>
      </ConfirmDialog>
    </>
  )
}

export default TransactionList
