const router = require('express').Router();
const c = require('../controllers/vacancyController');
const { protect, requireRole } = require('../middleware/auth');

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const director = [protect, requireRole('director')];

router.get('/', protect, wrap(c.listOpen));
router.post('/', director, wrap(c.create));
router.get('/mine', director, wrap(c.mine));        // keep above the /:id routes
router.put('/:id', director, wrap(c.update));
router.patch('/:id/close', director, wrap(c.close));

module.exports = router;