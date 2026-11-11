import { useState } from 'react'
import RoleCard from './components/RoleCard'

export default function App() {
  const [role, setRole] = useState('actor')

  return (
    <div style={{ padding: 32, maxWidth: 560 }}>
      <h1 style={{ fontSize: 40, marginBottom: 16 }}>Role</h1>

      <div
        role="radiogroup"
        aria-label="Choose your role"
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}
      >
        <RoleCard
          title="Actor"
          description="Find and apply for casting calls"
          selected={role === 'actor'}
          onSelect={() => setRole('actor')}
        />
        <RoleCard
          title="Director"
          description="Post casting calls and review actors"
          selected={role === 'director'}
          onSelect={() => setRole('director')}
        />
      </div>

      <p style={{ marginTop: 16 }}>Selected role: {role}</p>
    </div>
  )
}