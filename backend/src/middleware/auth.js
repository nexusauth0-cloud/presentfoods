const jwt = require('jsonwebtoken');

// Guaranteed to exist: src/index.js refuses to start without JWT_SECRET.
const JWT_SECRET = process.env.JWT_SECRET;

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    // Load user role
    const db = require('../db');
    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(req.userId);
    req.userRole = user?.role || 'user';
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { authMiddleware };
