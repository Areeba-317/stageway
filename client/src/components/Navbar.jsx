import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

const links = {
  actor: [
    { to: '/actor', label: 'Browse Vacancies', end: true },
    { to: '/actor/portfolio', label: 'My Portfolio' },
  ],
  director: [
    { to: '/director', label: 'My Vacancies', end: true },
    { to: '/director/post', label: 'Post Vacancy' },
  ],
}

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    signOut()
    navigate('/login', { replace: true })
  }

  return (
    <header className="nav">
      <span className="nav-logo">StageWay</span>
      <nav className="nav-links">
        {(links[user.role] || []).map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end}>
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="nav-user">
        <span>{user.fullName}</span>
        <button className="link-btn" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </header>
  )
}