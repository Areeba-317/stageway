import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import Input from '../components/Input'
import PasswordInput from '../components/PasswordInput'
import RoleCard from '../components/RoleCard'
import Button from '../components/Button'
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

export default function SignUp() {
  const [form, setForm] = useState(initialForm)

  const update = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const setRole = (role) => setForm((prev) => ({ ...prev, role }))

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form:', form)
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
            onSelect={() => setRole('actor')}
          />
          <RoleCard
            title="Director"
            description="Post casting calls and review actors"
            selected={form.role === 'director'}
            onSelect={() => setRole('director')}
          />
        </div>

        <Input
          label="Full name"
          placeholder="e.g. Tariq Khan"
          autoComplete="name"
          value={form.fullName}
          onChange={update('fullName')}
        />

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={form.email}
          onChange={update('email')}
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
        />

        <PasswordInput
          label="Password"
          placeholder="Enter password"
          autoComplete="new-password"
          showStrength
          value={form.password}
          onChange={update('password')}
        />

        <PasswordInput
          label="Confirm password"
          placeholder="Re-enter password"
          autoComplete="new-password"
          value={form.confirm}
          onChange={update('confirm')}
        />

        <label className="terms">
          <input type="checkbox" checked={form.terms} onChange={update('terms')} />
          <span>
            I agree to the <a href="#">Terms</a> and <a href="#">Privacy Policy</a>
          </span>
        </label>

        <Button type="submit" fullWidth>
          Create account
        </Button>
      </form>

      <p className="signup-footer">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  )
}