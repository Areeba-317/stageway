import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import OTPInput from '../components/OTPInput'
import Button from '../components/Button'
import { verifyOtp, resendOtp } from '../services/api'
import './Auth.css'

const empty = () => Array(6).fill('')

export default function VerifyOtp() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [digits, setDigits] = useState(empty())
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [seconds, setSeconds] = useState(60)
  const [devOtp, setDevOtp] = useState(state?.devOtp || '')

  useEffect(() => {
    if (seconds <= 0) return
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds])

  if (!state?.userId) return <Navigate to="/signup" replace />

  const code = digits.join('')
  const fallback = 'Something went wrong. Please try again.'

  const handleVerify = async () => {
    setError('')
    setInfo('')
    setLoading(true)
    try {
      await verifyOtp({ userId: state.userId, code })
      navigate('/login', { state: { verified: true } })
    } catch (err) {
      setError(err.response?.data?.message || fallback)
      setDigits(empty())
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setInfo('')
    try {
      const res = await resendOtp({ userId: state.userId })
      setSeconds(60)
      setDigits(empty())
      setDevOtp(res.devOtp || '')
      setInfo('A new code has been sent.')
    } catch (err) {
      setError(err.response?.data?.message || fallback)
    }
  }

  return (
    <AuthLayout
      headingLine1="Almost there."
      headingLine2="One quick check."
      urdu="اپنا فون نمبر تصدیق کریں"
      bullets={['Keeps your account secure.', 'Takes less than a minute.']}
      headerLink={<Link to="/login">Log in</Link>}
    >
      <h1 className="signup-title">Verify your phone</h1>
      <p className="auth-sub">
        We sent a 6-digit code to {state.phone || 'your phone'}.{' '}
        <Link to="/signup">Change number</Link>
      </p>

      <div className="auth-form">
        <OTPInput digits={digits} onChange={setDigits} error={error} />

        {error ? <p className="notice notice-error" role="alert">{error}</p> : null}
        {info ? <p className="notice notice-success">{info}</p> : null}
        {import.meta.env.DEV && devOtp ? (
          <p className="notice">Dev code: {devOtp}</p>
        ) : null}

        <Button fullWidth loading={loading} disabled={code.length < 6} onClick={handleVerify}>
          Verify
        </Button>

        <div className="auth-links">
          <span>Didn't get a code?</span>
          <button className="link-btn" disabled={seconds > 0} onClick={handleResend}>
            {seconds > 0 ? `Resend in 0:${String(seconds).padStart(2, '0')}` : 'Resend code'}
          </button>
        </div>
      </div>
    </AuthLayout>
  )
}