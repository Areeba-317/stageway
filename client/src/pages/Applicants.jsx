import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import { getApplicants } from '../services/api'
import './Applicants.css'
import './MyVacancies.css'

export default function Applicants() {
  const { id } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getApplicants(id)
      .then(setItems)
      .catch((err) => setError(err.response?.data?.message || 'Could not load applicants.'))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <AppLayout>
      <button className="link-btn" onClick={() => navigate('/director')}>← Back to my vacancies</button>
      <h1 style={{ fontSize: 36, marginTop: 8 }}>Applicants</h1>
      <p className="page-sub">{state?.title || 'Casting call'}</p>

      {loading ? <p>Loading...</p> : null}
      {error ? <p className="notice notice-error" role="alert">{error}</p> : null}
      {!loading && !error && items.length === 0 ? (
        <div className="mv-empty"><p>No applications yet.</p></div>
      ) : null}

      <div className="ap-list">
        {items.map((a) => {
          const p = a.portfolio
          return (
            <article className="ap-card" key={a._id}>
              <h2 style={{ fontSize: 26 }}>{a.actor?.fullName}</h2>
              <p className="ap-meta">
                {a.actor?.email}{a.actor?.phone ? ` • ${a.actor.phone}` : ''}
                {p?.age ? ` • Age ${p.age}` : ''}
              </p>
              {p ? (
                <div className="bv-chips">
                  {(p.languages || []).map((l) => <span className="chip" key={l}>{l}</span>)}
                  {(p.skills || []).map((s) => <span className="chip" key={s}>{s}</span>)}
                </div>
              ) : <p className="ap-meta">No portfolio saved.</p>}
              {p?.bio ? <p style={{ margin: 0 }}>{p.bio}</p> : null}
              {a.note ? <p className="ap-note">Note: {a.note}</p> : null}
              <div className="ap-videos">
                {(p?.videos || []).map((v) => (
                  <video key={v._id} src={v.url} controls preload="metadata" />
                ))}
              </div>
            </article>
          )
        })}
      </div>
    </AppLayout>
  )
}