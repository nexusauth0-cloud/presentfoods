const { Router } = require('express');
const { adminMiddleware } = require('../middleware/admin');
const db = require('../db');

const router = Router();

// Meals CRUD
router.post('/meals', adminMiddleware, (req, res) => {
  try {
    const { name, description, price, originalPrice, category, image, rating, discount, isNew } = req.body;
    if (!name || !description || !price || !category || !image) {
      res.status(400).json({ error: 'Name, description, price, category, and image are required' });
      return;
    }
    const id = 'm' + Date.now().toString().slice(-4);
    db.prepare('INSERT INTO meals (id, name, description, price, originalPrice, category, image, rating, discount, isNew) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, name, description, price, originalPrice || null, category, image, rating || 4.5, discount || 0, isNew ? 1 : 0);
    const meal = db.prepare('SELECT * FROM meals WHERE id = ?').get(id);
    res.status(201).json({ meal });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

router.put('/meals/:id', adminMiddleware, (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM meals WHERE id = ?').get(req.params.id);
    if (!existing) { res.status(404).json({ error: 'Meal not found' }); return; }
    const { name, description, price, originalPrice, category, image, rating, discount, isNew } = req.body;
    db.prepare('UPDATE meals SET name=?, description=?, price=?, originalPrice=?, category=?, image=?, rating=?, discount=?, isNew=? WHERE id=?')
      .run(name || existing.name, description || existing.description, price || existing.price,
        originalPrice !== undefined ? originalPrice : existing.originalPrice,
        category || existing.category, image || existing.image,
        rating || existing.rating, discount !== undefined ? discount : existing.discount,
        isNew !== undefined ? (isNew ? 1 : 0) : existing.isNew, req.params.id);
    const meal = db.prepare('SELECT * FROM meals WHERE id = ?').get(req.params.id);
    res.json({ meal });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

router.delete('/meals/:id', adminMiddleware, (req, res) => {
  try {
    db.prepare('DELETE FROM meals WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// Orders management
router.get('/orders', adminMiddleware, (req, res) => {
  try {
    const orders = db.prepare('SELECT * FROM orders ORDER BY createdAt DESC').all();
    res.json({ orders: orders.map(o => ({ ...o, items: JSON.parse(o.items), deliveryAddress: JSON.parse(o.deliveryAddress) })) });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

router.put('/orders/:id/status', adminMiddleware, (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
    if (!valid.includes(status)) { res.status(400).json({ error: 'Invalid status' }); return; }
    const existing = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!existing) { res.status(404).json({ error: 'Order not found' }); return; }
    db.prepare("UPDATE orders SET status = ?, updatedAt = datetime('now') WHERE id = ?").run(status, req.params.id);
    // Notify user
    const { v4: uuidv4 } = require('uuid');
    const nid = uuidv4();
    db.prepare('INSERT INTO notifications (id, userId, type, title, message) VALUES (?, ?, ?, ?, ?)')
      .run(nid, existing.userId, 'order', 'Order Updated', `Your order ${req.params.id} is now ${status.replace(/_/g, ' ')}.`);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// Users list (admin)
router.get('/users', adminMiddleware, (req, res) => {
  try {
    const users = db.prepare('SELECT id, name, email, phone, role, createdAt FROM users ORDER BY createdAt DESC').all();
    res.json({ users });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

router.put('/users/:id/role', adminMiddleware, (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) { res.status(400).json({ error: 'Invalid role' }); return; }
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
