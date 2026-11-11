import './RoleCard.css'

export default function RoleCard({ title, description, selected, onSelect }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={`role-card ${selected ? 'role-card-selected' : ''}`}
      onClick={onSelect}
    >
      <span className="role-card-top">
        <span className="role-card-title">{title}</span>
        <span className="role-card-mark" aria-hidden="true">
          {selected ? (
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#CC9E4A" strokeWidth="2" />
              <path
                d="M7.5 12.5l3 3 6-6.5"
                stroke="#CC9E4A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#B9B4AD" strokeWidth="2" />
            </svg>
          )}
        </span>
      </span>
      <span className="role-card-desc">{description}</span>
    </button>
  )
}