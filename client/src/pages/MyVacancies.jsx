import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import Button from '../components/Button'
import { getMyVacancies, closeVacancy } from '../services/api'
import './MyVacancies.css'

export default function MyVacancies() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setError('')
    try {
      setItems(await getMyVacancies())
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load your vacancies.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleClose = async (v) => {
    if (!window.confirm(`Close "${v.title}"? Actors will no longer see it.`)) return
    try {
      await closeVacancy(v._id || v.id)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not close the vacancy.')
    }
  }

  const fmt = (d) => (d ? new Date(d).toLocaleDateString() : 'No deadline')

  return (
    <AppLayout>
      <div className="mv-head">
        <div>
        <h1 style={{ fontSize: 36 }}>My vacancies</h1>
        <p className="page-sub" style={{ marginBottom: 0 }}>Review, revise, and close your active casting calls.</p>
        </div>
        <Button onClick={() => navigate('/director/post')}>Post a vacancy</Button>
      </div>

      {state?.saved ? <p className="notice notice-success">{state.saved}</p> : null}
      {error ? <p className="notice notice-error" role="alert">{error}</p> : null}

      {loading ? <p>Loading...</p> : null}

      {!loading && !error && items.length === 0 ? (
        <div className="mv-empty">
          <p>You haven't posted any casting calls yet.</p>
          <Link to="/director/post">Post your first vacancy</Link>
        </div>
      ) : null}

      <div className="mv-list">
        {items.map((v) => (
          <article className="mv-card" key={v._id || v.id}>
            <div className="mv-top">
              <h2 className="mv-title">{v.title}</h2>
              <span className={`badge ${v.status === 'closed' ? 'badge-closed' : 'badge-open'}`}>
                {v.status === 'closed' ? 'Closed' : 'Open'}
              </span>
            </div>
            <p className="mv-desc">{v.description}</p>
            <p className="mv-meta">
              Deadline: {fmt(v.deadline)}
              {v.location ? ` · ${v.location}` : ''}
              {v.ageMin != null || v.ageMax != null ? ` · Age ${v.ageMin ?? '?'}-${v.ageMax ?? '?'}` : ''}
            </p>
            {v.status !== 'closed' ? (
              <div className="mv-actions">
                <Button variant="secondary" onClick={() => navigate('/director/post', { state: { vacancy: v } })}>
                  Edit
                </Button>
                <Button variant="secondary" onClick={() => handleClose(v)}>Close</Button>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </AppLayout>
  )
}