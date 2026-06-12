const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware } = require('../middleware/auth');
const db = require('../db');

const router = Router();
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';

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

// Initialize Paystack transaction for wallet top-up
router.post('/initialize', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount < 100) { res.status(400).json({ error: 'Amount must be at least ₦100' }); return; }
    const user = db.prepare('SELECT email FROM users WHERE id = ?').get(req.userId);
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        amount: amount * 100,
        currency: 'NGN',
        metadata: { userId: req.userId },
        callback_url: `${req.protocol}://${req.get('host')}/api/wallet/callback`,
      }),
    });
    const data = await response.json();
    if (!data.status) { res.status(400).json({ error: data.message || 'Paystack initialization failed' }); return; }
    res.json({ authorization_url: data.data.authorization_url, reference: data.data.reference });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify Paystack transaction
router.get('/verify/:reference', authMiddleware, async (req, res) => {
  try {
    // Check if already processed
    const existing = db.prepare('SELECT * FROM wallet_transactions WHERE description = ?').get(`paystack:${req.params.reference}`);
    if (existing) { res.json({ success: true, balance: getBalance(req.userId) }); return; }

    const response = await fetch(`https://api.paystack.co/transaction/verify/${req.params.reference}`, {
      headers: { 'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}` },
    });
    const data = await response.json();
    if (!data.status || data.data.status !== 'success') {
      res.status(400).json({ error: 'Payment verification failed' });
      return;
    }

    const amount = data.data.amount / 100;
    const id = uuidv4();
    db.prepare('INSERT INTO wallet_transactions (id, userId, type, amount, description) VALUES (?, ?, ?, ?, ?)')
      .run(id, req.userId, 'credit', amount, `paystack:${req.params.reference}`);

    res.json({ success: true, balance: getBalance(req.userId) });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Direct Paystack charge (for checkout)
router.post('/pay', authMiddleware, async (req, res) => {
  try {
    const { amount, email, metadata } = req.body;
    if (!amount || amount < 100) { res.status(400).json({ error: 'Amount must be at least ₦100' }); return; }

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email || 'customer@presentfoods.ng',
        amount: amount * 100,
        currency: 'NGN',
        metadata: { ...metadata, userId: req.userId },
      }),
    });
    const data = await response.json();
    if (!data.status) { res.status(400).json({ error: data.message || 'Payment initialization failed' }); return; }
    res.json({ authorization_url: data.data.authorization_url, reference: data.data.reference });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/pay/verify/:reference', authMiddleware, async (req, res) => {
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${req.params.reference}`, {
      headers: { 'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}` },
    });
    const data = await response.json();
    if (!data.status || data.data.status !== 'success') {
      res.status(400).json({ error: 'Payment verification failed' });
      return;
    }
    res.json({ success: true, data: data.data });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

function getBalance(userId) {
  const credit = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM wallet_transactions WHERE userId = ? AND type = ?').get(userId, 'credit');
  const debit = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM wallet_transactions WHERE userId = ? AND type = ?').get(userId, 'debit');
  return credit.total - debit.total;
}

module.exports = router;
