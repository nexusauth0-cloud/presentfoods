const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware } = require('../middleware/auth');
const db = require('../db');

const router = Router();

router.get('/', authMiddleware, (req, res) => {
  try {
    const notifications = db.prepare('SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC').all(req.userId);
    res.json({ notifications });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id/read', authMiddleware, (req, res) => {
  try {
    db.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND userId = ?').run(req.params.id, req.userId);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/read-all', authMiddleware, (req, res) => {
  try {
    db.prepare('UPDATE notifications SET read = 1 WHERE userId = ?').run(req.userId);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/unread-count', authMiddleware, (req, res) => {
  try {
    const { count } = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND read = 0').get(req.userId);
    res.json({ count });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
