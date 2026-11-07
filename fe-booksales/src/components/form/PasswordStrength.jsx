import { passwordStrength } from '../../lib/validation.js'

const LEVELS = ['', 'Lemah', 'Cukup', 'Kuat', 'Sangat kuat']

function PasswordStrength({ value }) {
  const score = passwordStrength(value)
  if (!value) return null

  return (
    <div className={`strength strength-${score}`} aria-live="polite">
      <div className="strength-bar" aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={i <= score ? 'on' : ''} />
        ))}
      </div>
      <small>Kekuatan password: {LEVELS[score] || 'Sangat lemah'}</small>
    </div>
  )
}

export default PasswordStrength
