const router = require('express').Router();
const c = require('../controllers/portfolioController');
const { protect, requireRole } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const actor = [protect, requireRole('actor')];

router.get('/me', actor, wrap(c.getMine));
router.put('/me', actor, wrap(c.update));
// Auth runs before the upload, so strangers can't push files
router.post('/me/videos', actor, upload.single('video'), wrap(c.addVideo));
router.delete('/me/videos/:videoId', actor, wrap(c.removeVideo));
router.get('/:userId', protect, requireRole('director'), wrap(c.getByUser)); // keep last

module.exports = router;