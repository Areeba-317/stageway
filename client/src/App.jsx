import { useState } from 'react'
import Input from './components/Input'

export default function App() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  return (
    <div style={{ padding: 32, display: 'grid', gap: 20, maxWidth: 400 }}>
      <h1 style={{ fontSize: 40 }}>Inputs</h1>

      <Input
        label="Full name"
        placeholder="e.g. Tariq Khan"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <Input
        label="Phone number"
        prefix="+92"
        placeholder="300 1234567"
        helper="We'll send a verification code by SMS."
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <Input
        label="Email"
        placeholder="you@example.com"
        error="Enter a valid email address"
      />

      <Input label="Disabled field" placeholder="Can't type here" disabled />
    </div>
  )
}