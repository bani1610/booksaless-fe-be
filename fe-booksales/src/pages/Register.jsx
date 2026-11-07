import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Alert from '../components/Alert.jsx'
import TextField from '../components/form/TextField.jsx'
import PasswordField from '../components/form/PasswordField.jsx'
import PasswordStrength from '../components/form/PasswordStrength.jsx'
import { useForm } from '../hooks/useForm.js'
import { api } from '../lib/api.js'
import { validateField } from '../lib/validation.js'

const INITIAL = {
  name: '',
  email: '',
  username: '',
  password: '',
  password_confirmation: '',
}

function Register() {
  const formRef = useRef(null)
  const { values, setErrors, field, validateAll } = useForm(INITIAL, validateField)
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(null)

  function focusFirstError() {
    // Tunggu render berikutnya agar aria-invalid sudah terpasang
    requestAnimationFrame(() => {
      formRef.current?.querySelector('[aria-invalid="true"]')?.focus()
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')
    if (!validateAll()) {
      focusFirstError()
      return
    }

    setLoading(true)
    try {
      const res = await api.register({
        ...values,
        name: values.name.trim(),
        email: values.email.trim(),
      })
      setRegistered(res.data)
    } catch (err) {
      // Error validasi dari Laravel (422) ditampilkan di bawah field terkait
      const fieldErrors = Object.fromEntries(
        Object.entries(err.errors).map(([key, messages]) => [key, messages[0]]),
      )
      if (Object.keys(fieldErrors).length) {
        setErrors(fieldErrors)
        focusFirstError()
      } else {
        setServerError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  if (registered) {
    return (
      <div className="auth-page">
        <div className="card auth-card auth-success" role="status">
          <span className="success-mark" aria-hidden="true">✓</span>
          <h1>Akun berhasil dibuat</h1>
          <p className="muted">
            Selamat datang, <strong>{registered.name}</strong>. Akun dengan username{' '}
            <strong>@{registered.username}</strong> sudah terdaftar menggunakan email{' '}
            {registered.email}.
          </p>
          <Link to="/login" state={{ email: registered.email }} className="btn btn-primary btn-block">
            Lanjut ke halaman masuk
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-split card">
        <aside className="auth-aside">
          <Link to="/" className="brand brand-link">
            <span className="brand-mark">B</span>
            <span>Booksales</span>
          </Link>
          <div>
            <h2>Toko buku dari penulis yang Anda sukai.</h2>
            <p>Satu akun untuk menyimpan riwayat transaksi dan membeli buku lebih cepat.</p>
          </div>
          <ul className="auth-points">
            <li>Telusuri katalog per genre dan penulis</li>
            <li>Riwayat pembelian tersimpan di akun</li>
            <li>Gratis, daftar kurang dari satu menit</li>
          </ul>
        </aside>
      <form ref={formRef} className="auth-form" onSubmit={handleSubmit} noValidate>
        <Link to="/" className="brand brand-link auth-form-brand">
          <span className="brand-mark">B</span>
          <span>Booksales</span>
        </Link>
        <div>
          <h1>Buat akun</h1>
          <p className="muted">Daftar untuk mulai membeli buku di Booksales.</p>
        </div>

        <Alert>{serverError}</Alert>

        <TextField
          label="Nama lengkap"
          autoComplete="name"
          placeholder="Contoh: Sholahuddin Robbani"
          {...field('name')}
        />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="nama@email.com"
          {...field('email')}
        />
        <TextField
          label="Username"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="contoh: bani_1610"
          hint="4–30 karakter: huruf kecil, angka, titik, atau garis bawah."
          {...field('username')}
        />

        <div className="field-row">
          <div>
            <PasswordField
              label="Password"
              autoComplete="new-password"
              hint="Minimal 8 karakter, berisi huruf dan angka."
              {...field('password')}
            />
            <PasswordStrength value={values.password} />
          </div>
          <PasswordField
            label="Konfirmasi password"
            autoComplete="new-password"
            {...field('password_confirmation')}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Mendaftarkan…' : 'Daftar'}
        </button>

        <p className="auth-switch">
          Sudah punya akun? <Link to="/login">Masuk</Link>
        </p>
      </form>
      </div>
    </div>
  )
}

export default Register
