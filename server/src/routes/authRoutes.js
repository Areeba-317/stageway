const router = require('express').Router();
const c = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Forwards async errors to the error handler in app.js
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.post('/signup', wrap(c.signup));
router.post('/verify-otp', wrap(c.verifyOtp));
router.post('/resend-otp', wrap(c.resendOtp));
router.post('/login', wrap(c.login));
router.get('/me', protect, wrap(c.me));

module.exports = router;