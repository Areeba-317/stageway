import { Routes, Route, Navigate } from 'react-router-dom'
import SignUp from './pages/SignUp'
import VerifyOtp from './pages/VerifyOtp'
import Login from './pages/Login'
import Placeholder from './pages/Placeholder'
import MyVacancies from './pages/MyVacancies'
import PostVacancy from './pages/PostVacancy'
import ProtectedRoute from './components/ProtectedRoute'
import BrowseVacancies from './pages/BrowseVacancies'
import Portfolio from './pages/Portfolio'
import VacancyDetails from './pages/VacancyDetails'
import Applicants from './pages/Applicants'

const guard = (role, element) => <ProtectedRoute role={role}>{element}</ProtectedRoute>

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signup" replace />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/login" element={<Login />} />

      <Route path="/actor" element={guard('actor', <BrowseVacancies />)} />
      <Route path="/actor/portfolio" element={guard('actor', <Portfolio />)} />
      <Route path="/actor/vacancy/:id" element={guard('actor', <VacancyDetails />)} />
      <Route path="/director" element={guard('director', <MyVacancies />)} />
      <Route path="/director/post" element={guard('director', <PostVacancy />)} />
      <Route path="/director/vacancy/:id/applicants" element={guard('director', <Applicants />)} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}