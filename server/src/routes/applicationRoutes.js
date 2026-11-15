const router = require('express').Router();
const c = require('../controllers/applicationController');
const { protect, requireRole } = require('../middleware/auth');

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get('/mine', protect, requireRole('actor'), wrap(c.mine));

module.exports = router;