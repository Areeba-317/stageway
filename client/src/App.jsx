import { Routes, Route, Navigate } from 'react-router-dom'
import SignUp from './pages/SignUp'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signup" replace />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<p style={{ padding: 32 }}>Login page (coming soon)</p>} />
      <Route path="/verify-otp" element={<p style={{ padding: 32 }}>OTP page (coming soon)</p>} />
    </Routes>
  )
}