const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware } = require('../middleware/auth');
const db = require('../db');

const router = Router();

router.get('/', authMiddleware, (req, res) => {
  try {
    const orders = db.prepare('SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC').all(req.userId);
    res.json({ orders: orders.map(o => ({ ...o, items: JSON.parse(o.items), deliveryAddress: JSON.parse(o.deliveryAddress) })) });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', authMiddleware, (req, res) => {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND userId = ?').get(req.params.id, req.userId);
    if (!order) { res.status(404).json({ error: 'Order not found' }); return; }
    res.json({ order: { ...order, items: JSON.parse(order.items), deliveryAddress: JSON.parse(order.deliveryAddress) } });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authMiddleware, (req, res) => {
  try {
    const { items, deliveryAddress, deliveryNote, customerName, customerEmail, customerPhone } = req.body;
    if (!items?.length || !deliveryAddress || !customerName) {
      res.status(400).json({ error: 'Items, delivery address, and customer name are required' });
      return;
    }

    // Recalculate totals server-side from database meal prices
    // Accept both `id` and `mealId` as the item's meal reference (the web
    // client sends `mealId`, while some callers send `id`).
    const mealIds = items.map(i => i.id ?? i.mealId);
    const placeholders = mealIds.map(() => '?').join(',');
    const meals = db.prepare(`SELECT id, price, originalPrice, discount FROM meals WHERE id IN (${placeholders})`).all(...mealIds);
    const mealMap = Object.fromEntries(meals.map(m => [m.id, m]));

    let total = 0;
    let discount = 0;
    for (const item of items) {
      const id = item.id ?? item.mealId;
      const meal = mealMap[id];
      if (!meal) {
        res.status(400).json({ error: `Meal not found: ${id}` });
        return;
      }
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      const lineTotal = meal.price * qty;
      total += lineTotal;
      if (meal.discount) discount += lineTotal * (meal.discount / 100);
    }
    const finalTotal = total - discount;

    const id = uuidv4();
    const now = new Date().toISOString();

    const createOrder = db.transaction(() => {
      db.prepare(`INSERT INTO orders (id, userId, items, total, discount, finalTotal, deliveryAddress, deliveryNote, customerName, customerEmail, customerPhone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(id, req.userId, JSON.stringify(items), total, discount, finalTotal, JSON.stringify(deliveryAddress), deliveryNote || '', customerName, customerEmail || '', customerPhone || '');

      // Notify user
      const userNotifId = uuidv4();
      const itemSummary = items.map(i => `${i.name} x${i.quantity}`).join(', ');
      db.prepare('INSERT INTO notifications (id, userId, type, title, message) VALUES (?, ?, ?, ?, ?)')
        .run(userNotifId, req.userId, 'order', 'Order Placed', `Your order has been received. Items: ${itemSummary}`);

      // Notify all admin users
      const admins = db.prepare('SELECT id FROM users WHERE role = ?').all('admin');
      const adminNotifMsg = `New order from ${customerName} — ₦${finalTotal.toLocaleString()}`;
      const insertNotif = db.prepare('INSERT INTO notifications (id, userId, type, title, message) VALUES (?, ?, ?, ?, ?)');
      for (const admin of admins) {
        insertNotif.run(uuidv4(), admin.id, 'admin_order', 'New Order', adminNotifMsg);
      }
    });
    createOrder();

    res.status(201).json({
      order: { id, items, total, discount, finalTotal, deliveryAddress, deliveryNote, customerName, customerEmail, customerPhone, status: 'pending', createdAt: now },
    });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Cancel order (user can cancel only if status is pending)
router.patch('/:id/cancel', authMiddleware, (req, res) => {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND userId = ?').get(req.params.id, req.userId);
    if (!order) { res.status(404).json({ error: 'Order not found' }); return; }
    if (order.status !== 'pending') { res.status(400).json({ error: 'Only pending orders can be cancelled' }); return; }
    db.prepare("UPDATE orders SET status = 'cancelled', updatedAt = datetime('now') WHERE id = ?").run(req.params.id);
    const nid = uuidv4();
    db.prepare('INSERT INTO notifications (id, userId, type, title, message) VALUES (?, ?, ?, ?, ?)')
      .run(nid, req.userId, 'order', 'Order Cancelled', `Your order ${req.params.id} has been cancelled.`);
    res.json({ success: true, message: 'Order cancelled successfully' });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
