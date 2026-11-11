import { useState } from 'react'
import PasswordInput from './components/PasswordInput'

export default function App() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  return (
    <div style={{ padding: 32, display: 'grid', gap: 20, maxWidth: 400 }}>
      <h1 style={{ fontSize: 40 }}>Password</h1>

      <PasswordInput
        label="Password"
        placeholder="Enter password"
        showStrength
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <PasswordInput
        label="Confirm password"
        placeholder="Re-enter password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        error={confirm && confirm !== password ? 'Passwords do not match' : ''}
      />
    </div>
  )
}