const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

function createNotification(userId, type, title, message) {
  const id = uuidv4();
  db.prepare('INSERT INTO notifications (id, userId, type, title, message) VALUES (?, ?, ?, ?, ?)').run(id, userId, type, title, message);
}

router.post('/signup', (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }
    const id = uuidv4();
    const hashed = bcrypt.hashSync(password, 10);
    const adminCode = req.body.adminCode || '';
    const role = adminCode === process.env.ADMIN_CODE ? 'admin' : 'user';
    db.prepare('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)').run(id, name, email.toLowerCase(), hashed, role);

    // Welcome notification
    createNotification(id, 'general', 'Welcome to Present Foods!', `Hi ${name}, welcome! Enjoy 20% off your first order.`);

    const token = jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id, name, email: email.toLowerCase(), phone: '', avatar: '', role, createdAt: new Date().toISOString() } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    if (!user) {
      res.status(401).json({ error: 'No account found with this email' });
      return;
    }
    if (!bcrypt.compareSync(password, user.password)) {
      res.status(401).json({ error: 'Incorrect password' });
      return;
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, avatar: user.avatar, role: user.role, createdAt: user.createdAt } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me', authMiddleware, (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, phone, avatar, role, createdAt FROM users WHERE id = ?').get(req.userId);
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json({ user });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/profile', authMiddleware, (req, res) => {
  try {
    const { name, phone } = req.body;
    const updates = [];
    const values = [];
    if (name) { updates.push('name = ?'); values.push(name); }
    if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
    if (updates.length === 0) { res.status(400).json({ error: 'No fields to update' }); return; }
    values.push(req.userId);
    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    const user = db.prepare('SELECT id, name, email, phone, avatar, role, createdAt FROM users WHERE id = ?').get(req.userId);
    res.json({ user });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
