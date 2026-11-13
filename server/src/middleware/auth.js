const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Checks the "Authorization: Bearer <token>" header
exports.protect = async (req, res, next) => {
     try {
          const header = req.headers.authorization || '';
          const token = header.startsWith('Bearer ') ? header.slice(7) : null;
          if (!token) return res.status(401).json({ message: 'Not authenticated' });

          const payload = jwt.verify(token, process.env.JWT_SECRET);
          const user = await User.findById(payload.id);
          if (!user || !user.isVerified)
               return res.status(401).json({ message: 'Not authenticated' });

          req.user = user;
          next();
     } catch {
          res.status(401).json({ message: 'Invalid or expired token' });
     }
};

// Usage: requireRole('director')
exports.requireRole = (...roles) => (req, res, next) =>
     roles.includes(req.user.role)
          ? next()
          : res.status(403).json({ message: 'Access denied for your role' });