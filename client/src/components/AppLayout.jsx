import Navbar from './Navbar'
import Footer from './Footer'

export default function AppLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, width: '100%', maxWidth: 1100, margin: '0 auto', padding: '32px 40px' }}>
        {children}
      </main>
      <Footer />
    </div>
  )
}