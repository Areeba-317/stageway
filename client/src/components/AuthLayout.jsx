import { Link } from 'react-router-dom'
import './AuthLayout.css'

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="#CC9E4A" strokeWidth="2" />
      <path
        d="M7.5 12.5l3 3 6-6.5"
        stroke="#CC9E4A"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function AuthLayout({
  headingLine1,
  headingLine2,
  urdu,
  bullets = [],
  headerLink,
  children,
}) {
  return (
    <div className="auth">
      <header className="auth-header">
        <Link to="/signup" className="auth-logo">
          StageWay
        </Link>
        {headerLink}
      </header>

      <main className="auth-main">
        <aside className="auth-panel">
          <div>
            <h2 className="auth-panel-title">
              {headingLine1}
              <br />
              <span>{headingLine2}</span>
            </h2>
            <p className="auth-urdu" lang="ur" dir="rtl">
              {urdu}
            </p>
            <ul className="auth-bullets">
              {bullets.map((text) => (
                <li key={text}>
                  <CheckIcon />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="auth-panel-footer">Theatrical talent platform &amp; casting network</p>
        </aside>

        <section className="auth-card">{children}</section>
      </main>
    </div>
  )
}