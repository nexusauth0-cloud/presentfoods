const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');
const db = require('../db');

const router = Router();
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';

router.post('/initialize', authMiddleware, async (req, res) => {
  try {
    const { email, amount, callbackUrl } = req.body;
    if (!email) { res.status(400).json({ error: 'Email is required' }); return; }
    if (!amount || amount < 100) { res.status(400).json({ error: 'Amount must be at least ₦100' }); return; }

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amount * 100,
        currency: 'NGN',
        metadata: { userId: req.userId },
        callback_url: callbackUrl || `${req.protocol}://${req.get('host')}/api/payments/callback`,
      }),
    });

    const data = await response.json();
    if (!data.status) {
      res.status(400).json({ error: data.message || 'Paystack initialization failed' });
      return;
    }

    res.json({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
    });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
