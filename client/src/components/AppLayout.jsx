import Navbar from './Navbar'

export default function AppLayout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 40px' }}>
        {children}
      </main>
    </>
  )
}