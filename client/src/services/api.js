import axios from 'axios'

// Flip to false when the real backend is ready
const USE_MOCK = false
const BASE_URL = 'http://localhost:5001/api/auth'

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Makes an error shaped like the ones the real server will send
function fail(status, message, extra = {}) {
  const error = new Error(message)
  error.response = { status, data: { message, ...extra } }
  return error
}

async function mockSignup(data) {
  await wait(600)
  if (data.email === 'taken@test.com') {
    throw fail(409, 'An account with this email already exists')
  }
  if (data.phone === '3000000000') {
    throw fail(409, 'An account with this phone number already exists')
  }
  return {
    message: 'Account created. Verification code sent.',
    userId: '123',
    phone: `+92${data.phone}`,
    devOtp: '482913',
  }
}

async function mockVerifyOtp({ code }) {
  await wait(600)
  if (code === '000000') throw fail(400, 'That code has expired')
  if (code !== '482913') throw fail(400, 'Incorrect code. Please try again')
  return { message: 'Phone verified' }
}

async function mockResendOtp() {
  await wait(600)
  return { message: 'A new code has been sent', devOtp: '482913' }
}

async function mockLogin({ identifier, password }) {
  await wait(600)
  if (identifier === 'unverified@test.com') {
    throw fail(403, 'Please verify your phone first', { userId: '123' })
  }
  if (password !== 'Test@1234') {
    throw fail(401, 'Incorrect email/phone or password')
  }
  const role = identifier.startsWith('director') ? 'director' : 'actor'
  return {
    token: 'fake-token',
    user: { id: '123', fullName: 'Test User', role },
  }
}

// Real API calls, used once USE_MOCK is false
const http = axios.create({ baseURL: BASE_URL })
const real = (path, data) => http.post(path, data).then((res) => res.data)

export const signup = async (data) => {
  if (USE_MOCK) return mockSignup(data)
  const res = await real('/signup', data)
  const userId = res.userId || res.id || res._id || res.user?._id || res.user?.id
  return { ...res, userId, phone: res.phone || `+92${data.phone}` }
}

export const verifyOtp = ({ userId, code }) =>
  USE_MOCK
    ? mockVerifyOtp({ code })
    : real('/verify-otp', { userId, id: userId, code, otp: code })

export const resendOtp = ({ userId }) =>
  USE_MOCK ? mockResendOtp() : real('/resend-otp', { userId, id: userId })

export const login = async ({ identifier, password }) => {
  if (USE_MOCK) return mockLogin({ identifier, password })
  const res = await real('/login', { email: identifier, identifier, password })
  const u = res.user || {}
  return {
    token: res.token,
    user: {
      id: u.id || u._id,
      fullName: u.fullName || u.name,
      role: String(u.role || '').toLowerCase(),
    },
  }
}

// ---- Vacancies (real backend) ----
const VAC_URL = 'http://localhost:5001/api/vacancies'
const vac = axios.create({ baseURL: VAC_URL })
vac.interceptors.request.use((config) => {
  const token = localStorage.getItem('sw_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
const toList = (d) => (Array.isArray(d) ? d : d?.vacancies || d?.data || d?.items || [])

export const createVacancy = (data) => vac.post('/', data).then((r) => r.data)
export const getMyVacancies = () => vac.get('/mine').then((r) => toList(r.data))
export const updateVacancy = (id, data) => vac.put(`/${id}`, data).then((r) => r.data)
export const closeVacancy = (id) => vac.patch(`/${id}/close`).then((r) => r.data)
export const getVacancies = (params) =>
  vac.get('/', { params }).then((r) => ({ items: toList(r.data), raw: r.data }))

// ---- Portfolio and applications ----
const MOCK_PORTFOLIO = true // set to false when Rafay's endpoints are ready
const MOCK_APPLY = true // same for applications

const api = axios.create({ baseURL: 'http://localhost:5001/api' })
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sw_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const fileUrl = (u) =>
  !u || u.startsWith('http') || u.startsWith('blob:') ? u : `http://localhost:5001${u}`

let mockPortfolio = { bio: '', age: '', languages: [], skills: [], videos: [] }
const unwrap = (r) => r.data.portfolio || r.data

export const getPortfolio = async () => {
  if (MOCK_PORTFOLIO) { await wait(400); return { ...mockPortfolio } }
  return unwrap(await api.get('/portfolio/me'))
}

export const savePortfolio = async (data) => {
  if (MOCK_PORTFOLIO) {
    await wait(500)
    mockPortfolio = { ...mockPortfolio, ...data }
    return { ...mockPortfolio }
  }
  return unwrap(await api.put('/portfolio/me', data))
}

export const uploadVideo = async (file) => {
  if (MOCK_PORTFOLIO) {
    await wait(900)
    const video = { _id: String(Date.now()), url: URL.createObjectURL(file), name: file.name }
    mockPortfolio = { ...mockPortfolio, videos: [...mockPortfolio.videos, video] }
    return { ...mockPortfolio }
  }
  const body = new FormData()
  body.append('video', file)
  return unwrap(await api.post('/portfolio/me/videos', body))
}

export const deleteVideo = async (videoId) => {
  if (MOCK_PORTFOLIO) {
    await wait(300)
    mockPortfolio = { ...mockPortfolio, videos: mockPortfolio.videos.filter((v) => v._id !== videoId) }
    return { ...mockPortfolio }
  }
  return unwrap(await api.delete(`/portfolio/me/videos/${videoId}`))
}

const mockApplied = new Set()
export const applyToVacancy = async ({ vacancyId, note }) => {
  if (MOCK_APPLY) {
    await wait(600)
    if (mockApplied.has(vacancyId)) throw fail(409, 'You have already applied to this casting call')
    mockApplied.add(vacancyId)
    return { message: 'Application sent' }
  }
  return (await api.post('/applications', { vacancyId, note })).data
}