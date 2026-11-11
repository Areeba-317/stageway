import axios from 'axios'

// Flip to false when the real backend is ready
const USE_MOCK = true
const BASE_URL = 'http://localhost:5000/api/auth'

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

export const signup = (data) =>
  USE_MOCK ? mockSignup(data) : real('/signup', data)

export const verifyOtp = (data) =>
  USE_MOCK ? mockVerifyOtp(data) : real('/verify-otp', data)

export const resendOtp = (data) =>
  USE_MOCK ? mockResendOtp(data) : real('/resend-otp', data)

export const login = (data) =>
  USE_MOCK ? mockLogin(data) : real('/login', data)