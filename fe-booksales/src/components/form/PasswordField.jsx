import { useState } from 'react'
import TextField from './TextField.jsx'

function PasswordField(props) {
  const [visible, setVisible] = useState(false)

  return (
    <TextField {...props} type={visible ? 'text' : 'password'}>
      <button
        type="button"
        className="input-toggle"
        onClick={() => setVisible((v) => !v)}
        aria-pressed={visible}
        aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'}
      >
        {visible ? 'Sembunyikan' : 'Tampilkan'}
      </button>
    </TextField>
  )
}

export default PasswordField
