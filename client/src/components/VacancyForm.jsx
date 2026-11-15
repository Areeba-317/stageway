import { useState } from 'react'
import Input from './Input'
import Button from './Button'
import './VacancyForm.css'

const blank = {
  title: '', description: '', roleType: '', gender: 'any',
  ageMin: '', ageMax: '', location: '', compensation: '', deadline: '',
}

function fromVacancy(v) {
  if (!v) return blank
  return {
    title: v.title || '',
    description: v.description || '',
    roleType: v.roleType || '',
    gender: v.gender || 'any',
    ageMin: v.ageMin ?? '',
    ageMax: v.ageMax ?? '',
    location: v.location || '',
    compensation: v.compensation || '',
    deadline: v.deadline ? v.deadline.slice(0, 10) : '',
  }
}

function validate(f) {
  const e = {}
  if (!f.title.trim()) e.title = 'Enter a title for the role'
  if (f.description.trim().length < 20) e.description = 'Describe the role in at least 20 characters'

  const min = f.ageMin === '' ? null : Number(f.ageMin)
  const max = f.ageMax === '' ? null : Number(f.ageMax)
  if (min !== null && (Number.isNaN(min) || min < 0 || min > 120)) e.ageMin = 'Enter an age from 0 to 120'
  if (max !== null && (Number.isNaN(max) || max < 0 || max > 120)) e.ageMax = 'Enter an age from 0 to 120'
  if (min !== null && max !== null && !e.ageMin && !e.ageMax && min > max)
    e.ageMax = 'Max age must be at least the min age'

  if (!f.deadline) e.deadline = 'Choose an application deadline'
  else {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (new Date(f.deadline) < today) e.deadline = 'The deadline cannot be in the past'
  }
  return e
}

export default function VacancyForm({ initial, submitLabel, onSubmit }) {
  const [form, setForm] = useState(() => fromVacancy(initial))
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const errors = validate(form)
  const show = (f) => (touched[f] ? errors[f] : '')
  const blur = (f) => () => setTouched((t) => ({ ...t, [f]: true }))
  const update = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    setTouched(Object.fromEntries(Object.keys(blank).map((k) => [k, true])))
    if (Object.keys(errors).length) return

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      gender: form.gender,
      deadline: form.deadline,
    }
    if (form.roleType.trim()) payload.roleType = form.roleType.trim()
    if (form.location.trim()) payload.location = form.location.trim()
    if (form.compensation.trim()) payload.compensation = form.compensation.trim()
    if (form.ageMin !== '') payload.ageMin = Number(form.ageMin)
    if (form.ageMax !== '') payload.ageMax = Number(form.ageMax)

    setLoading(true)
    try {
      await onSubmit(payload)
    } catch (err) {
      setServerError(err.response?.data?.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form className="vform" onSubmit={handleSubmit} noValidate>
      <Input
        label="Role title"
        placeholder="e.g. Lead comic role in a family sitcom"
        value={form.title}
        onChange={update('title')}
        onBlur={blur('title')}
        error={show('title')}
      />

      <div className="field">
        <label className="field-label" htmlFor="vf-desc">Description</label>
        <textarea
          id="vf-desc"
          className={`textarea ${show('description') ? 'textarea-error' : ''}`}
          rows={6}
          placeholder="Describe the role, the project, and what you are looking for"
          value={form.description}
          onChange={update('description')}
          onBlur={blur('description')}
        />
        {show('description') ? <p className="field-message field-error">{show('description')}</p> : null}
      </div>

      <div className="vform-row">
        <Input
          label="Role type (optional)"
          placeholder="e.g. Lead, Supporting"
          value={form.roleType}
          onChange={update('roleType')}
        />
        <div className="field">
          <label className="field-label" htmlFor="vf-gender">Gender</label>
          <select id="vf-gender" className="select" value={form.gender} onChange={update('gender')}>
            <option value="any">Any</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>

      <div className="vform-row">
        <Input
          label="Minimum age (optional)"
          type="number"
          value={form.ageMin}
          onChange={update('ageMin')}
          onBlur={blur('ageMin')}
          error={show('ageMin')}
        />
        <Input
          label="Maximum age (optional)"
          type="number"
          value={form.ageMax}
          onChange={update('ageMax')}
          onBlur={blur('ageMax')}
          error={show('ageMax')}
        />
      </div>

      <div className="vform-row">
        <Input
          label="Location (optional)"
          placeholder="e.g. Lahore"
          value={form.location}
          onChange={update('location')}
        />
        <Input
          label="Compensation (optional)"
          placeholder="e.g. PKR 20,000 per day"
          value={form.compensation}
          onChange={update('compensation')}
        />
      </div>

      <Input
        label="Application deadline"
        type="date"
        value={form.deadline}
        onChange={update('deadline')}
        onBlur={blur('deadline')}
        error={show('deadline')}
      />

      {serverError ? <p className="notice notice-error" role="alert">{serverError}</p> : null}

      <Button type="submit" loading={loading}>{submitLabel}</Button>
    </form>
  )
}