import { Routes, Route, Navigate } from 'react-router-dom'
import SignUp from './pages/SignUp'
import VerifyOtp from './pages/VerifyOtp'
import Login from './pages/Login'
import Placeholder from './pages/Placeholder'
import ProtectedRoute from './components/ProtectedRoute'

const actor = (path, title) => (
  <Route
    path={path}
    element={
      <ProtectedRoute role="actor">
        <Placeholder title={title} />
      </ProtectedRoute>
    }
  />
)

const director = (path, title) => (
  <Route
    path={path}
    element={
      <ProtectedRoute role="director">
        <Placeholder title={title} />
      </ProtectedRoute>
    }
  />
)

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signup" replace />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/login" element={<Login />} />

      {actor('/actor', 'Browse Vacancies')}
      {actor('/actor/portfolio', 'My Portfolio')}
      {director('/director', 'My Vacancies')}
      {director('/director/post', 'Post Vacancy')}

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}