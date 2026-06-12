const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware } = require('../middleware/auth');
const db = require('../db');

const router = Router();

router.get('/', authMiddleware, (req, res) => {
  try {
    const addresses = db.prepare('SELECT * FROM addresses WHERE userId = ? ORDER BY isDefault DESC, createdAt DESC').all(req.userId);
    res.json({ addresses });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authMiddleware, (req, res) => {
  try {
    const { label, street, city, state, phone, isDefault } = req.body;
    if (!street || !city || !state || !phone) {
      res.status(400).json({ error: 'Street, city, state, and phone are required' });
      return;
    }
    const id = uuidv4();
    if (isDefault) db.prepare('UPDATE addresses SET isDefault = 0 WHERE userId = ?').run(req.userId);
    db.prepare('INSERT INTO addresses (id, userId, label, street, city, state, phone, isDefault) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, req.userId, label || 'Home', street, city, state, phone, isDefault ? 1 : 0);
    const addr = db.prepare('SELECT * FROM addresses WHERE id = ?').get(id);
    res.status(201).json({ address: addr });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authMiddleware, (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM addresses WHERE id = ? AND userId = ?').get(req.params.id, req.userId);
    if (!existing) { res.status(404).json({ error: 'Address not found' }); return; }
    const { label, street, city, state, phone, isDefault } = req.body;
    if (isDefault) db.prepare('UPDATE addresses SET isDefault = 0 WHERE userId = ?').run(req.userId);
    db.prepare('UPDATE addresses SET label = ?, street = ?, city = ?, state = ?, phone = ?, isDefault = ? WHERE id = ?')
      .run(label || existing.label, street || existing.street, city || existing.city, state || existing.state, phone || existing.phone, isDefault !== undefined ? (isDefault ? 1 : 0) : existing.isDefault, req.params.id);
    const addr = db.prepare('SELECT * FROM addresses WHERE id = ?').get(req.params.id);
    res.json({ address: addr });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authMiddleware, (req, res) => {
  try {
    db.prepare('DELETE FROM addresses WHERE id = ? AND userId = ?').run(req.params.id, req.userId);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
