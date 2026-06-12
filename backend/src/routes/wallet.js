const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');
const db = require('../db');

const router = Router();

router.get('/', authMiddleware, (req, res) => {
  try {
    const credit = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM wallet_transactions WHERE userId = ? AND type = ?').get(req.userId, 'credit');
    const debit = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM wallet_transactions WHERE userId = ? AND type = ?').get(req.userId, 'debit');
    const balance = credit.total - debit.total;
    const transactions = db.prepare('SELECT * FROM wallet_transactions WHERE userId = ? ORDER BY createdAt DESC').all(req.userId);
    res.json({ balance, transactions });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
