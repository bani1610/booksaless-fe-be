const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const USERNAME_PATTERN = /^[a-z0-9_.]+$/

// Setiap aturan mengembalikan pesan error, atau string kosong jika valid
const rules = {
  name(value) {
    const v = value.trim()
    if (!v) return 'Nama lengkap wajib diisi.'
    if (v.length < 3) return 'Nama lengkap minimal 3 karakter.'
    return ''
  },
  email(value) {
    const v = value.trim()
    if (!v) return 'Email wajib diisi.'
    if (!EMAIL_PATTERN.test(v)) return 'Format email tidak valid, contoh: nama@email.com.'
    return ''
  },
  username(value) {
    if (!value) return 'Username wajib diisi.'
    if (value.length < 4) return 'Username minimal 4 karakter.'
    if (value.length > 30) return 'Username maksimal 30 karakter.'
    if (!USERNAME_PATTERN.test(value))
      return 'Hanya huruf kecil, angka, titik (.), dan garis bawah (_).'
    return ''
  },
  password(value) {
    if (!value) return 'Password wajib diisi.'
    if (value.length < 8) return 'Password minimal 8 karakter.'
    if (!/[a-zA-Z]/.test(value) || !/\d/.test(value))
      return 'Password harus mengandung huruf dan angka.'
    return ''
  },
  password_confirmation(value, values) {
    if (!value) return 'Ulangi password Anda.'
    if (value !== values.password) return 'Konfirmasi password tidak sama.'
    return ''
  },
}

export function validateField(name, values) {
  return rules[name] ? rules[name](values[name], values) : ''
}

export function validateRegister(values) {
  const errors = {}
  for (const name of Object.keys(rules)) {
    const message = validateField(name, values)
    if (message) errors[name] = message
  }
  return errors
}

// Skor 0–4 untuk indikator kekuatan password
export function passwordStrength(value) {
  if (!value) return 0
  let score = 0
  if (value.length >= 8) score++
  if (value.length >= 12) score++
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++
  if (/\d/.test(value) && /[^a-zA-Z0-9]/.test(value)) score++
  return score
}
