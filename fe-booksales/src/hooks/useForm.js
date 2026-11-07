import { useState } from 'react'

// State form + validasi per field. `validate(name, values)` mengembalikan pesan error.
export function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  function handleChange(e) {
    const { name, value } = e.target
    const next = { ...values, [name]: value }
    setValues(next)

    // Setelah field pernah disentuh, error diperbarui sambil mengetik
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validate(name, next) }))
    }
    // Konfirmasi password ikut dicek ulang jika password berubah
    if (name === 'password' && touched.password_confirmation) {
      setErrors((prev) => ({
        ...prev,
        password_confirmation: validate('password_confirmation', next),
      }))
    }
  }

  function handleBlur(e) {
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors((prev) => ({ ...prev, [name]: validate(name, values) }))
  }

  // Dipanggil saat submit: tandai semua field dan kembalikan true jika valid
  function validateAll() {
    const all = {}
    for (const name of Object.keys(values)) {
      const message = validate(name, values)
      if (message) all[name] = message
    }
    setErrors(all)
    setTouched(Object.fromEntries(Object.keys(values).map((k) => [k, true])))
    return Object.keys(all).length === 0
  }

  function field(name) {
    return {
      name,
      value: values[name],
      onChange: handleChange,
      onBlur: handleBlur,
      error: errors[name],
    }
  }

  return { values, errors, setErrors, field, validateAll }
}
