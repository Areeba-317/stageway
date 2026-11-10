export default function App() {
  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 40 }}>StageWay</h1>
      <p>Find your next role. Discover your next star.</p>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        {['navy', 'crimson', 'gold', 'ivory', 'obsidian'].map((c) => (
          <div
            key={c}
            style={{
              width: 64,
              height: 64,
              borderRadius: 12,
              background: `var(--${c})`,
              border: '1px solid var(--border)',
            }}
          />
        ))}
      </div>
    </div>
  )
}