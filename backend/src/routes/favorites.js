const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');
const db = require('../db');

const router = Router();

router.get('/', authMiddleware, (req, res) => {
  try {
    const favorites = db.prepare('SELECT * FROM favorites WHERE userId = ? ORDER BY createdAt DESC').all(req.userId);
    res.json({ favorites: favorites.map(f => ({ ...f, mealData: JSON.parse(f.mealData) })) });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:mealId', authMiddleware, (req, res) => {
  try {
    const { mealId } = req.params;
    const { mealData } = req.body;
    db.prepare('INSERT OR IGNORE INTO favorites (userId, mealId, mealData) VALUES (?, ?, ?)').run(req.userId, mealId, JSON.stringify(mealData));
    res.status(201).json({ success: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:mealId', authMiddleware, (req, res) => {
  try {
    db.prepare('DELETE FROM favorites WHERE userId = ? AND mealId = ?').run(req.userId, req.params.mealId);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
