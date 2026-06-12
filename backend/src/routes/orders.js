const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware } = require('../middleware/auth');
const db = require('../db');

const router = Router();
const ADMIN_PHONE = process.env.ADMIN_PHONE || '2348082563629';

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
    const { items, total, discount, finalTotal, deliveryAddress, deliveryNote, customerName, customerEmail, customerPhone } = req.body;
    if (!items?.length || !deliveryAddress || !customerName) {
      res.status(400).json({ error: 'Items, delivery address, and customer name are required' });
      return;
    }
    const id = 'ORD-' + Date.now().toString().slice(-6);
    const now = new Date().toISOString();

    db.prepare(`INSERT INTO orders (id, userId, items, total, discount, finalTotal, deliveryAddress, deliveryNote, customerName, customerEmail, customerPhone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, req.userId, JSON.stringify(items), total || 0, discount || 0, finalTotal || total, JSON.stringify(deliveryAddress), deliveryNote || '', customerName, customerEmail || '', customerPhone || '');

    // Notify user
    const userNotifId = uuidv4();
    const itemSummary = items.map(i => `${i.name} x${i.quantity}`).join(', ');
    db.prepare('INSERT INTO notifications (id, userId, type, title, message) VALUES (?, ?, ?, ?, ?)')
      .run(userNotifId, req.userId, 'order', 'Order Placed', `Your order ${id} has been received. Items: ${itemSummary}`);

    // Notify all admin users
    const admins = db.prepare('SELECT id FROM users WHERE role = ?').all('admin');
    const adminNotifId = uuidv4();
    const adminNotifMsg = `New order ${id} from ${customerName} — ₦${(finalTotal || total).toLocaleString()}`;
    const insertNotif = db.prepare('INSERT INTO notifications (id, userId, type, title, message) VALUES (?, ?, ?, ?, ?)');
    for (const admin of admins) {
      insertNotif.run(adminNotifId + '-' + admin.id, admin.id, 'admin_order', 'New Order', adminNotifMsg);
    }

    // Build WhatsApp deep link for admin
    const orderSummary = `Order ${id}%0aCustomer: ${customerName}%0aPhone: ${customerPhone || deliveryAddress.phone}%0aItems: ${itemSummary}%0aTotal: ₦${(finalTotal || total).toLocaleString()}%0aAddress: ${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.state}`;
    const whatsappLink = `https://wa.me/${ADMIN_PHONE}?text=${orderSummary}`;

    res.status(201).json({
      order: { id, items, total, discount, finalTotal: finalTotal || total, deliveryAddress, deliveryNote, customerName, customerEmail, customerPhone, status: 'pending', createdAt: now },
      whatsappLink,
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
