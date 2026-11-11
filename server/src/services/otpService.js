const crypto = require('crypto');

const OTP_TTL_MS = 5 * 60 * 1000;     // 5 minutes
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute

const hashOtp = (otp) =>
     crypto.createHmac('sha256', process.env.JWT_SECRET).update(String(otp)).digest('hex');

// For now this only logs. Swap in a real SMS provider later.
async function sendOtp(phone, otp) {
     console.log(`[OTP] ${phone} -> ${otp}`);
}

async function issueOtp(user) {
     const otp = String(crypto.randomInt(100000, 1000000)); // 6 digits
     user.otpHash = hashOtp(otp);
     user.otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
     user.otpAttempts = 0;
     user.otpLastSentAt = new Date();
     await user.save();
     await sendOtp(user.phone, otp);
     return otp;
}

function isOtpMatch(user, otp) {
     const a = Buffer.from(hashOtp(otp));
     const b = Buffer.from(user.otpHash);
     return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = { issueOtp, isOtpMatch, MAX_ATTEMPTS, RESEND_COOLDOWN_MS };