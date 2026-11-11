import { useState } from 'react'
import Input from './Input'
import { getPasswordStrength, STRENGTH_LABELS } from '../utils/password'
import './PasswordInput.css'

export default function PasswordInput({
  showStrength = false,
  value = '',
  ...props
}) {
  const [visible, setVisible] = useState(false)
  const score = showStrength ? getPasswordStrength(value) : 0

  return (
    <div className="pw">
      <Input
        {...props}
        value={value}
        type={visible ? 'text' : 'password'}
        rightElement={
          <button
            type="button"
            className="pw-toggle"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? 'Hide' : 'Show'}
          </button>
        }
      />

      {showStrength ? (
        <div className="pw-strength" aria-live="polite">
          <div className="pw-bars">
            {[1, 2, 3, 4].map((n) => (
              <span
                key={n}
                className={`pw-bar ${n <= score ? `pw-bar-on pw-level-${score}` : ''}`}
              />
            ))}
          </div>
          <span className="pw-label">
            {value ? STRENGTH_LABELS[score] || 'Too short' : 'Use 8+ characters, a number and a symbol'}
          </span>
        </div>
      ) : null}
    </div>
  )
}