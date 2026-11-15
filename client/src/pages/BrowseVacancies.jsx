import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import Button from '../components/Button'
import { getVacancies } from '../services/api'
import './BrowseVacancies.css'

const PAGE_SIZE = 6
const GENDER_LABEL = { any: 'Any gender', male: 'Male', female: 'Female' }

function closesIn(deadline) {
  if (!deadline) return 'No deadline'
  const days = Math.ceil((new Date(deadline) - new Date()) / 86400000)
  if (days <= 0) return 'Closes today'
  return days === 1 ? 'Closes in 1 day' : `Closes in ${days} days`
}

function ageText(v) {
  if (v.ageMin == null && v.ageMax == null) return null
  return `Age ${v.ageMin ?? '?'}–${v.ageMax ?? '?'}`
}

export default function BrowseVacancies() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [gender, setGender] = useState('any')
  const [age, setAge] = useState('')
  const [location, setLocation] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    getVacancies({ limit: 100 })
      .then((r) => setItems(r.items))
      .catch((err) => setError(err.response?.data?.message || 'Could not load casting calls.'))
      .finally(() => setLoading(false))
  }, [])

  const locations = useMemo(
    () => [...new Set(items.map((v) => v.location).filter(Boolean))],
    [items],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return items.filter((v) => {
      if (v.status === 'closed') return false
      if (v.deadline && new Date(v.deadline) < today) return false
      if (q && !`${v.title} ${v.description} ${v.roleType || ''}`.toLowerCase().includes(q)) return false
      if (gender !== 'any' && v.gender !== 'any' && v.gender !== gender) return false
      if (age !== '') {
        const n = Number(age)
        if (v.ageMin != null && n < v.ageMin) return false
        if (v.ageMax != null && n > v.ageMax) return false
      }
      if (location && v.location !== location) return false
      return true
    })
  }, [items, search, gender, age, location])

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, pages)
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  const change = (setter) => (e) => {
    setter(e.target.value)
    setPage(1)
  }

  const clear = () => {
    setSearch('')
    setGender('any')
    setAge('')
    setLocation('')
    setPage(1)
  }

  return (
    <AppLayout>
      <h1 style={{ fontSize: 40 }}>Casting calls</h1>
      <p className="bv-sub">Explore open audition notices and character roles across Urdu theatre, satire, and television.</p>

      <div className="bv-toolbar">
        <input
          className="bv-input bv-search"
          placeholder="Search by role or keyword"
          value={search}
          onChange={change(setSearch)}
          aria-label="Search"
        />
        <select className="bv-input" value={gender} onChange={change(setGender)} aria-label="Gender">
          <option value="any">Gender: Any</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <input
          className="bv-input"
          type="number"
          min="0"
          placeholder="Age (e.g. 28)"
          value={age}
          onChange={change(setAge)}
          aria-label="Age"
        />
        <select className="bv-input" value={location} onChange={change(setLocation)} aria-label="Location">
          <option value="">All locations</option>
          {locations.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <button className="link-btn" onClick={clear}>Clear filters</button>
      </div>

      {error ? <p className="notice notice-error" role="alert">{error}</p> : null}
      {loading ? <p>Loading...</p> : null}

      {!loading && !error && filtered.length === 0 ? (
        <div className="bv-empty">
          <p>No casting calls match your search</p>
          <Button variant="secondary" onClick={clear}>Clear filters</Button>
        </div>
      ) : null}

      <div className="bv-grid">
        {visible.map((v) => (
          <article className="bv-card" key={v._id || v.id}>
            <h2 className="bv-title">{v.title}</h2>
            <p className="bv-meta">
              {v.director?.fullName ? `${v.director.fullName} • ` : ''}
              {v.location ? `${v.location} • ` : ''}
              {closesIn(v.deadline)}
            </p>
            <p className="bv-desc">{v.description}</p>
            <div className="bv-chips">
              <span className="chip">{GENDER_LABEL[v.gender] || 'Any gender'}</span>
              {ageText(v) ? <span className="chip">{ageText(v)}</span> : null}
              {v.roleType ? <span className="chip">{v.roleType}</span> : null}
            </div>
            <div className="bv-foot">
              <span className="bv-comp">{v.compensation || 'Compensation not stated'}</span>
              <Button onClick={() => navigate(`/actor/vacancy/${v._id || v.id}`, { state: { vacancy: v } })}>
                View and apply
              </Button>
            </div>
          </article>
        ))}
      </div>

      {pages > 1 ? (
        <nav className="bv-pages" aria-label="Pagination">
          <button className="pg" disabled={current === 1} onClick={() => setPage(current - 1)}>Previous</button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              className={`pg ${n === current ? 'pg-on' : ''}`}
              onClick={() => setPage(n)}
              aria-current={n === current ? 'page' : undefined}
            >
              {n}
            </button>
          ))}
          <button className="pg" disabled={current === pages} onClick={() => setPage(current + 1)}>Next</button>
        </nav>
      ) : null}
    </AppLayout>
  )
}