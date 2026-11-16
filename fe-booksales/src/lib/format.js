const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

export function formatRupiah(value) {
  return rupiah.format(Number(value) || 0)
}

const tanggal = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' })

export function formatDate(value) {
  return value ? tanggal.format(new Date(value)) : '-'
}

// Warna sampul dipilih dari id genre supaya buku satu genre terlihat seragam (dipakai sampul & rak genre)
const COVER_PALETTE = ['#1f5c4a', '#7a3b2e', '#2f4a73', '#6b4f1d', '#4b3a6b', '#2e5e63']

export function coverColor(id) {
  return COVER_PALETTE[(Number(id) || 0) % COVER_PALETTE.length]
}
