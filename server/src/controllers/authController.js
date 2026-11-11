const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { issueOtp, isOtpMatch, MAX_ATTEMPTS, RESEND_COOLDOWN_MS } = require('../services/otpService');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?\d{10,15}$/;

const signToken = (u) =>
     jwt.sign({ id: u._id, role: u.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

const publicUser = (u) => ({
     id: u._id, fullName: u.fullName, email: u.email, phone: u.phone, role: u.role,
});

// POST /api/auth/signup
exports.signup = async (req, res) => {
     const { fullName, email, phone, password, role } = req.body;

     if ([fullName, email, phone, password, role].some((v) => typeof v !== 'string' || !v.trim()))
          return res.status(400).json({ message: 'All fields are required' });
     if (!EMAIL_RE.test(email.trim()))
          return res.status(400).json({ message: 'Invalid email format' });
     const cleanPhone = phone.replace(/[\s-]/g, '');
     if (!PHONE_RE.test(cleanPhone))
          return res.status(400).json({ message: 'Invalid phone number' });
     if (password.length < 8)
          return res.status(400).json({ message: 'Password must be at least 8 characters' });
     if (!User.ROLES.includes(role))
          return res.status(400).json({ message: 'Invalid role' });

     const cleanEmail = email.trim().toLowerCase();
     const exists = await User.findOne({ $or: [{ email: cleanEmail }, { phone: cleanPhone }] });
     if (exists) return res.status(409).json({ message: 'Email or phone already registered' });

     const passwordHash = await bcrypt.hash(password, 10);
     const user = await User.create({
          fullName: fullName.trim(), email: cleanEmail, phone: cleanPhone, passwordHash, role,
     });

     const otp = await issueOtp(user);

     const body = { message: 'Account created. OTP sent.', userId: user._id, phone: user.phone };
     if (process.env.NODE_ENV === 'development') body.devOtp = otp;
     res.status(201).json(body);
};

// POST /api/auth/verify-otp   body: { userId, otp }
exports.verifyOtp = async (req, res) => {
     const { userId, otp } = req.body;
     if (!userId || typeof otp !== 'string' || !/^\d{6}$/.test(otp))
          return res.status(400).json({ message: 'userId and a 6-digit otp are required' });

     const user = await User.findById(userId).select('+otpHash');
     if (!user) return res.status(400).json({ message: 'Invalid request' });
     if (user.isVerified) return res.status(400).json({ message: 'Account already verified' });
     if (!user.otpHash || !user.otpExpiresAt || user.otpExpiresAt < new Date())
          return res.status(400).json({ message: 'OTP expired. Request a new one.' });
     if (user.otpAttempts >= MAX_ATTEMPTS)
          return res.status(429).json({ message: 'Too many attempts. Request a new OTP.' });

     if (!isOtpMatch(user, otp)) {
          user.otpAttempts += 1;
          await user.save();
          return res.status(400).json({ message: 'Incorrect OTP' });
     }

     user.isVerified = true;
     user.otpHash = undefined;
     user.otpExpiresAt = undefined;
     user.otpAttempts = 0;
     await user.save();

     res.json({ message: 'Phone verified', token: signToken(user), user: publicUser(user) });
};

// POST /api/auth/resend-otp   body: { userId }
exports.resendOtp = async (req, res) => {
     const { userId } = req.body;
     if (!userId) return res.status(400).json({ message: 'userId is required' });

     const user = await User.findById(userId);
     if (!user) return res.status(400).json({ message: 'Invalid request' });
     if (user.isVerified) return res.status(400).json({ message: 'Account already verified' });

     if (user.otpLastSentAt && Date.now() - user.otpLastSentAt.getTime() < RESEND_COOLDOWN_MS)
          return res.status(429).json({ message: 'Please wait a minute before requesting another OTP' });

     const otp = await issueOtp(user);
     const body = { message: 'OTP sent again' };
     if (process.env.NODE_ENV === 'development') body.devOtp = otp;
     res.json(body);
};

// POST /api/auth/login   body: { email, password }
exports.login = async (req, res) => {
     const { email, password } = req.body;
     if (typeof email !== 'string' || typeof password !== 'string' || !email || !password)
          return res.status(400).json({ message: 'Email and password are required' });

     const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');
     const ok = user && (await bcrypt.compare(password, user.passwordHash));
     if (!ok) return res.status(401).json({ message: 'Invalid email or password' });

     if (!user.isVerified)
          return res.status(403).json({ message: 'Please verify your phone first', userId: user._id });

     res.json({ message: 'Login successful', token: signToken(user), user: publicUser(user) });
};