import AppLayout from '../components/AppLayout'

export default function Placeholder({ title }) {
  return (
    <AppLayout>
      <h1 style={{ fontSize: 36 }}>{title}</h1>
      <p>Coming soon.</p>
    </AppLayout>
  )
}