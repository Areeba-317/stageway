import { useId } from 'react'
import './Input.css'

export default function Input({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  helper,
  prefix,
  rightElement,
  autoComplete,
  disabled = false,
}) {
  const id = useId()
  const messageId = `${id}-message`
  const hasMessage = Boolean(error || helper)

  return (
    <div className="field">
      {label ? (
        <label className="field-label" htmlFor={id}>
          {label}
        </label>
      ) : null}

      <div className={`field-box ${error ? 'field-box-error' : ''}`}>
        {prefix ? <span className="field-prefix">{prefix}</span> : null}
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={hasMessage ? messageId : undefined}
          className="field-input"
        />
        {rightElement ? (
          <span className="field-right">{rightElement}</span>
        ) : null}
      </div>

      {hasMessage ? (
        <p
          id={messageId}
          className={error ? 'field-message field-error' : 'field-message'}
        >
          {error || helper}
        </p>
      ) : null}
    </div>
  )
}