import './Portfolio.css'
import './BrowseVacancies.css'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import Button from '../components/Button'
import { getVacancies, applyToVacancy } from '../services/api'
import './VacancyDetails.css'

export default function VacancyDetails() {
  const { id } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const [v, setV] = useState(state?.vacancy || null)
  const [loading, setLoading] = useState(!state?.vacancy)
  const [note, setNote] = useState('')
  const [applying, setApplying] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (v) return
    getVacancies()
      .then((r) => setV(r.items.find((x) => (x._id || x.id) === id) || null))
      .catch(() => setError('Could not load this casting call.'))
      .finally(() => setLoading(false))
  }, [])

  const apply = async () => {
    setError('')
    setApplying(true)
    try {
      await applyToVacancy({ vacancyId: id, note: note.trim() })
      setDone(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setApplying(false)
    }
  }

  if (loading) return <AppLayout><p>Loading...</p></AppLayout>
  if (!v) return <AppLayout><p>{error || 'This casting call was not found.'}</p></AppLayout>

  const expired = v.status === 'closed' || (v.deadline && new Date(v.deadline) < new Date())

  return (
    <AppLayout>
      <button className="link-btn" onClick={() => navigate('/actor')}>← Back to casting calls</button>
      <div className="vd">
        <article className="vd-main">
          <h1 style={{ fontSize: 36 }}>{v.title}</h1>
          <p className="vd-meta">
            {v.director?.fullName ? `${v.director.fullName} • ` : ''}
            {v.location ? `${v.location} • ` : ''}
            {v.deadline ? `Deadline ${new Date(v.deadline).toLocaleDateString()}` : 'No deadline'}
          </p>
          <div className="bv-chips">
            <span className="chip">{v.gender === 'any' ? 'Any gender' : v.gender}</span>
            {v.ageMin != null || v.ageMax != null ? (
              <span className="chip">Age {v.ageMin ?? '?'}–{v.ageMax ?? '?'}</span>
            ) : null}
            {v.roleType ? <span className="chip">{v.roleType}</span> : null}
          </div>
          <p className="vd-desc">{v.description}</p>
          <p className="vd-meta">{v.compensation || 'Compensation not stated'}</p>
        </article>

        <aside className="vd-apply">
          <h2 style={{ fontSize: 26 }}>Apply for this role</h2>
          {done ? (
            <p className="notice notice-success">Application sent. The director will see your portfolio.</p>
          ) : expired ? (
            <p className="notice">This casting call is closed.</p>
          ) : (
            <>
              <p className="vd-meta">Your portfolio and monologue videos are shared with the director.</p>
              <textarea className="pf-textarea" rows={4} placeholder="Add a short note (optional)"
                value={note} onChange={(e) => setNote(e.target.value)} />
              {error ? <p className="notice notice-error" role="alert">{error}</p> : null}
              <Button fullWidth loading={applying} onClick={apply}>Submit application</Button>
              <button className="link-btn" onClick={() => navigate('/actor/portfolio')}>Edit my portfolio</button>
            </>
          )}
        </aside>
      </div>
    </AppLayout>
  )
}