import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import Input from '../components/Input'
import PasswordInput from '../components/PasswordInput'
import Button from '../components/Button'
import { login } from '../services/api'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export default function Login() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { signIn } = useAuth()
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const errors = {}
  if (!form.identifier.trim()) errors.identifier = 'Enter your email or phone number'
  if (!form.password) errors.password = 'Enter your password'
  const show = (f) => (touched[f] ? errors[f] : '')
  const blur = (f) => () => setTouched((t) => ({ ...t, [f]: true }))
  const update = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    setTouched({ identifier: true, password: true })
    if (Object.keys(errors).length) return

    setLoading(true)
    try {
      const result = await login({
        identifier: form.identifier.trim(),
        password: form.password,
      })
      signIn(result.token, result.user)
      navigate(`/${result.user.role}`, { replace: true })
    } catch (err) {
      const data = err.response?.data
      if (err.response?.status === 403 && data?.userId) {
        navigate('/verify-otp', { state: { userId: data.userId } })
        return
      }
      setServerError(data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      headingLine1="Welcome back."
      headingLine2="The stage is set."
      urdu="اردو تھیٹر اور مزاحیہ ڈراموں کا سب سے بڑا نیٹ ورک"
      bullets={[
        'Pick up where you left off.',
        'Browse upcoming comedy and drama roles.',
        'Keep your portfolio up to date.',
      ]}
      headerLink={<Link to="/signup">Create account</Link>}
    >
      <h1 className="signup-title">Log in to your account</h1>
      <p className="auth-sub">Enter your details to continue.</p>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {state?.verified ? (
          <p className="notice notice-success">Phone verified. Please log in.</p>
        ) : null}

        <Input
          label="Email or phone number"
          placeholder="you@example.com"
          autoComplete="username"
          value={form.identifier}
          onChange={update('identifier')}
          onBlur={blur('identifier')}
          error={show('identifier')}
        />

        <PasswordInput
          label="Password"
          placeholder="Enter password"
          autoComplete="current-password"
          value={form.password}
          onChange={update('password')}
          onBlur={blur('password')}
          error={show('password')}
        />

        {serverError ? <p className="notice notice-error" role="alert">{serverError}</p> : null}

        <Button type="submit" fullWidth loading={loading}>
          Log in
        </Button>

        <p className="auth-links">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </form>
    </AuthLayout>
  )
}