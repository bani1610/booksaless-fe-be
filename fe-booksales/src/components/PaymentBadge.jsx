// Status pembayaran transaksi; teksnya selalu tertulis, warna hanya penegas
const LABELS = {
  paid: 'Lunas',
  pending: 'Menunggu pembayaran',
  cancelled: 'Dibatalkan',
}

function PaymentBadge({ status }) {
  return <span className={`pay-badge pay-${status}`}>{LABELS[status] ?? status}</span>
}

export default PaymentBadge
