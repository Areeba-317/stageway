import { signup } from './services/api'

export default function App() {
  const test = async () => {
    try {
      const result = await signup({ email: 'taken@test.com', phone: '3001234567' })
      console.log('Success:', result)
    } catch (err) {
      console.log('Error:', err.response.data.message)
    }
  }

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 40 }}>StageWay</h1>
      <button onClick={test}>Test signup</button>
    </div>
  )
}