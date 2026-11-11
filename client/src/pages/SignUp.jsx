import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import Input from '../components/Input'
import PasswordInput from '../components/PasswordInput'
import RoleCard from '../components/RoleCard'
import Button from '../components/Button'
import { signup } from '../services/api'
import './SignUp.css'

const initialForm = {
  role: 'actor',
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirm: '',
  terms: false,
}

function validate(f) {
  const e = {}
  if (!f.fullName.trim()) e.fullName = 'Enter your full name'
  if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Enter a valid email address'
  if (!/^3\d{9}$/.test(f.phone.replace(/\s/g, '')))
    e.phone = 'Enter a valid number, e.g. 300 1234567'
  if (f.password.length < 8) e.password = 'Use at least 8 characters'
  if (f.confirm !== f.password) e.confirm = 'Passwords do not match'
  if (!f.terms) e.terms = 'Please accept the terms to continue'
  return e
}

export default function SignUp() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const errors = validate(form)
  const show = (field) => (touched[field] ? errors[field] : '')
  const blur = (field) => () => setTouched((t) => ({ ...t, [field]: true }))

  const update = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    setTouched({
      fullName: true, email: true, phone: true,
      password: true, confirm: true, terms: true,
    })
    if (Object.keys(errors).length > 0) return

    setLoading(true)
    try {
      const result = await signup({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.replace(/\s/g, ''),
        password: form.password,
        role: form.role,
      })
      navigate('/verify-otp', {
        state: { userId: result.userId, phone: result.phone, devOtp: result.devOtp },
      })
    } catch (err) {
      setServerError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      headingLine1="Find your next role."
      headingLine2="Discover your next star."
      urdu="اردو تھیٹر اور مزاحیہ ڈراموں کا سب سے بڑا نیٹ ورک"
      bullets={[
        'Auditions across Lahore, Karachi, Islamabad, and beyond.',
        'Scripts and monologues for comedy and humor drama.',
        'Direct communication between actors and directors.',
      ]}
      headerLink={<Link to="/login">Log in</Link>}
    >
      <h1 className="signup-title">Create your account</h1>
      <p className="signup-sub">Join StageWay as an actor or a director.</p>

      <form className="signup-form" onSubmit={handleSubmit} noValidate>
        <div className="role-grid" role="radiogroup" aria-label="Choose your role">
          <RoleCard
            title="Actor"
            description="Find and apply for casting calls"
            selected={form.role === 'actor'}
            onSelect={() => setForm((p) => ({ ...p, role: 'actor' }))}
          />
          <RoleCard
            title="Director"
            description="Post casting calls and review actors"
            selected={form.role === 'director'}
            onSelect={() => setForm((p) => ({ ...p, role: 'director' }))}
          />
        </div>

        <Input
          label="Full name"
          placeholder="e.g. Tariq Khan"
          autoComplete="name"
          value={form.fullName}
          onChange={update('fullName')}
          onBlur={blur('fullName')}
          error={show('fullName')}
        />

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={form.email}
          onChange={update('email')}
          onBlur={blur('email')}
          error={show('email')}
        />

        <Input
          label="Phone number"
          type="tel"
          prefix="+92"
          placeholder="300 1234567"
          helper="We'll send a verification code by SMS."
          autoComplete="tel-national"
          value={form.phone}
          onChange={update('phone')}
          onBlur={blur('phone')}
          error={show('phone')}
        />

        <PasswordInput
          label="Password"
          placeholder="Enter password"
          autoComplete="new-password"
          showStrength
          value={form.password}
          onChange={update('password')}
          onBlur={blur('password')}
          error={show('password')}
        />

        <PasswordInput
          label="Confirm password"
          placeholder="Re-enter password"
          autoComplete="new-password"
          value={form.confirm}
          onChange={update('confirm')}
          onBlur={blur('confirm')}
          error={show('confirm')}
        />

        <div>
          <label className="terms">
            <input
              type="checkbox"
              checked={form.terms}
              onChange={update('terms')}
              onBlur={blur('terms')}
            />
            <span>
              I agree to the <a href="#">Terms</a> and <a href="#">Privacy Policy</a>
            </span>
          </label>
          {show('terms') ? (
            <p className="field-message field-error" style={{ marginTop: 6 }}>
              {show('terms')}
            </p>
          ) : null}
        </div>

        {serverError ? (
          <p className="field-message field-error" role="alert">{serverError}</p>
        ) : null}

        <Button type="submit" fullWidth loading={loading}>
          Create account
        </Button>
      </form>

      <p className="signup-footer">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  )
}