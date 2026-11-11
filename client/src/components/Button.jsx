import './Button.css'

export default function Button({
  children,
  variant = 'primary',
  loading = false,
  disabled = false,
  type = 'button',
  fullWidth = false,
  onClick,
}) {
  const classes = [
    'btn',
    `btn-${variant}`,
    fullWidth ? 'btn-full' : '',
    loading ? 'btn-loading' : '',
  ].join(' ')

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? <span className="btn-spinner" aria-hidden="true" /> : null}
      <span>{loading ? 'Please wait...' : children}</span>
    </button>
  )
}