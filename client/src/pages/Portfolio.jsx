import { useEffect, useRef, useState } from 'react'
import AppLayout from '../components/AppLayout'
import Input from '../components/Input'
import Button from '../components/Button'
import { getPortfolio, savePortfolio, uploadVideo, deleteVideo, fileUrl } from '../services/api'
import './Portfolio.css'

const MAX_MB = 50
const MAX_SECONDS = 30
const MAX_VIDEOS = 3
const TYPES = ['video/mp4', 'video/quicktime', 'video/webm']

const toList = (s) => s.split(',').map((x) => x.trim()).filter(Boolean)

function readDuration(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const v = document.createElement('video')
    v.preload = 'metadata'
    v.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(v.duration) }
    v.onerror = () => { URL.revokeObjectURL(url); resolve(null) } // can't read it: skip the check
    v.src = url
  })
}

export default function Portfolio() {
  const fileRef = useRef(null)
  const [form, setForm] = useState({ bio: '', age: '', languages: '', skills: '' })
  const [videos, setVideos] = useState([])
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [videoError, setVideoError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getPortfolio()
      .then((p) => {
        setForm({
          bio: p.bio || '',
          age: p.age ?? '',
          languages: (p.languages || []).join(', '),
          skills: (p.skills || []).join(', '),
        })
        setVideos(p.videos || [])
        setSaved(p.age != null && p.age !== '')
      })
      .catch((err) => setError(err.response?.data?.message || 'Could not load your portfolio.'))
      .finally(() => setLoading(false))
  }, [])

  const errors = {}
  const age = Number(form.age)
  const langs = toList(form.languages)
  if (form.age === '' || Number.isNaN(age) || age < 16 || age > 100) errors.age = 'Enter an age from 16 to 100'
  if (langs.length === 0) errors.languages = 'Add at least one language'
  else if (langs.length > 10 || langs.some((x) => x.length > 40))
    errors.languages = 'Use up to 10 languages, each under 40 characters'
  if (form.bio.length > 1000) errors.bio = 'Keep your bio under 1000 characters'
  const show = (f) => (touched[f] ? errors[f] : '')
  const blur = (f) => () => setTouched((t) => ({ ...t, [f]: true }))
  const update = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')
    setTouched({ age: true, languages: true, bio: true })
    if (Object.keys(errors).length) return
    setSaving(true)
    try {
      await savePortfolio({
        bio: form.bio.trim(),
        age,
        languages: toList(form.languages),
        skills: toList(form.skills),
      })
      setSaved(true)
      setMessage('Portfolio saved.')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save your portfolio.')
    } finally {
      setSaving(false)
    }
  }

  const handleFile = async (e) => {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    setVideoError('')
    if (!saved) return setVideoError('Save your profile first, then upload a video.')
    if (videos.length >= MAX_VIDEOS) return setVideoError('You can upload up to 3 videos. Delete one first.')
    if (!TYPES.includes(file.type)) return setVideoError('Please choose an MP4, MOV or WebM video.')
    if (file.size > MAX_MB * 1024 * 1024) return setVideoError(`The video must be under ${MAX_MB} MB.`)
    const seconds = await readDuration(file)
    if (seconds && seconds > MAX_SECONDS + 1)
      return setVideoError(`Monologues must be ${MAX_SECONDS} seconds or shorter.`)

    setUploading(true)
    try {
      const p = await uploadVideo(file)
      setVideos(p.videos || [])
    } catch (err) {
      setVideoError(err.response?.data?.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (v) => {
    if (!window.confirm('Delete this video?')) return
    try {
      const p = await deleteVideo(v._id)
      setVideos(p.videos || [])
    } catch (err) {
      setVideoError(err.response?.data?.message || 'Could not delete the video.')
    }
  }

  if (loading) return <AppLayout><p>Loading...</p></AppLayout>

  return (
    <AppLayout>
      <h1 style={{ fontSize: 36 }}>My portfolio</h1>
      <p className="page-sub">Directors see this when you apply. Add a short monologue video to stand out.</p>

      <form className="pf-card" onSubmit={handleSave} noValidate>
        {message ? <p className="notice notice-success">{message}</p> : null}
        {error ? <p className="notice notice-error" role="alert">{error}</p> : null}

        <div className="field">
          <label className="field-label" htmlFor="pf-bio">Bio (optional)</label>
          <textarea id="pf-bio" className="pf-textarea" rows={4} value={form.bio}
            placeholder="Tell directors about your acting experience"
            onChange={update('bio')} onBlur={blur('bio')} />
          {show('bio') ? <p className="field-message field-error">{show('bio')}</p> : null}
        </div>

        <div className="pf-row">
          <Input label="Age" type="number" value={form.age} onChange={update('age')}
            onBlur={blur('age')} error={show('age')} />
          <Input label="Languages" placeholder="e.g. Urdu, Punjabi, English" value={form.languages}
            onChange={update('languages')} onBlur={blur('languages')} error={show('languages')}
            helper="Separate with commas" />
        </div>

        <Input label="Skills (optional)" placeholder="e.g. Comedy, Improv, Mimicry" value={form.skills}
          onChange={update('skills')} helper="Separate with commas" />

        <Button type="submit" loading={saving}>Save portfolio</Button>
      </form>

      <section className="pf-card">
        <h2 style={{ fontSize: 28 }}>Monologue videos</h2>
        <div className="pf-drop">
          <p style={{ margin: '0 0 12px' }}>MP4, MOV or WebM, up to {MAX_SECONDS} seconds and {MAX_MB} MB</p>
          <input ref={fileRef} type="file" accept="video/mp4,video/quicktime,video/webm"
            hidden onChange={handleFile} />
          <Button variant="secondary" loading={uploading} onClick={() => fileRef.current.click()}>
            Choose a video
          </Button>
        </div>
        {videoError ? <p className="notice notice-error" role="alert">{videoError}</p> : null}

        {videos.length === 0 ? <p className="page-sub" style={{ margin: 0 }}>No videos yet.</p> : null}
        <div className="pf-videos">
          {videos.map((v) => (
            <div className="pf-video" key={v._id}>
              <video src={fileUrl(v.url)} controls preload="metadata" />
              <div className="pf-video-foot">
                <span>{v.name || v.originalName || 'Monologue'}</span>
                <button type="button" className="link-btn" onClick={() => handleDelete(v)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppLayout>
  )
}