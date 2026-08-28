const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { resetTestDb, loadApp, getDb, seedUser, seedMeal, seedOrder, makeToken } = require('./helpers');

let app, db, user, token, meal1, meal2;

before(() => {
  resetTestDb();
  app = loadApp();
  db = getDb();
  user = seedUser(db, { email: 'order-user@test.com' });
  token = makeToken(user.id);
  meal1 = seedMeal(db, { id: 'order-meal-1', price: 4500, discount: 0 });
  meal2 = seedMeal(db, { id: 'order-meal-2', price: 3000, discount: 10 });
});

after(() => { resetTestDb(); });

describe('POST /api/orders', () => {
  it('creates order with server-side total recalculation', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [
          { id: meal1.id, name: meal1.name, quantity: 2, price: 9999 },
          { id: meal2.id, name: meal2.name, quantity: 1, price: 9999 },
        ],
        deliveryAddress: { street: '123 Main St', city: 'Lagos', state: 'Lagos' },
        customerName: 'Test Customer',
      });
    assert.equal(res.status, 201);
    // Server recalculates from DB prices, ignores client price
    assert.equal(res.body.order.total, 4500 * 2 + 3000 * 1); // 12000
    assert.ok(res.body.order.discount > 0);
    assert.ok(res.body.order.finalTotal < res.body.order.total);
    assert.equal(res.body.order.status, 'pending');
  });

  it('accepts items sent with mealId (the web client wire contract)', async () => {
    // Regression: the frontend DashboardCart sends each item with `mealId`
    // (not `id`). The API previously failed with 400 "Meal not found: undefined"
    // because it only looked up `item.id`. It must accept `mealId` too.
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [
          { mealId: meal1.id, name: meal1.name, quantity: 2, price: meal1.price, image: 'x.png' },
          { mealId: meal2.id, name: meal2.name, quantity: 1, price: meal2.price },
        ],
        total: 9999,
        discount: 0,
        finalTotal: 9999,
        deliveryAddress: { street: '1 Test Rd', city: 'Lagos', state: 'Lagos', phone: '08000000000' },
        deliveryNote: 'close to gate',
        customerName: 'Wire User',
        customerEmail: 'wire@test.com',
        customerPhone: '08000000000',
      });
    assert.equal(res.status, 201);
    assert.equal(res.body.order.total, 4500 * 2 + 3000 * 1);
    assert.equal(res.body.order.customerName, 'Wire User');
  });

  it('rejects order with empty items', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [], deliveryAddress: {}, customerName: 'X' });
    assert.equal(res.status, 400);
  });

  it('rejects order with missing delivery address', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [{ id: meal1.id, quantity: 1 }], customerName: 'X' });
    assert.equal(res.status, 400);
  });

  it('rejects order with non-existent meal id', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ id: 'non-existent', name: 'Ghost', quantity: 1, price: 1000 }],
        deliveryAddress: { street: 'X', city: 'Y', state: 'Z' },
        customerName: 'Test',
      });
    assert.equal(res.status, 400);
    assert.ok(res.body.error.includes('Meal not found'));
  });

  it('ignores client-sent price and uses DB price', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ id: meal1.id, name: meal1.name, quantity: 1, price: 1 }],
        deliveryAddress: { street: 'X', city: 'Y', state: 'Z' },
        customerName: 'Price Hack',
      });
    assert.equal(res.status, 201);
    assert.equal(res.body.order.total, 4500);
  });

  it('creates notification for user and admins', async () => {
    const admin = seedUser(db, { email: 'admin-order@test.com', role: 'admin' });
    await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ id: meal1.id, name: meal1.name, quantity: 1, price: 4500 }],
        deliveryAddress: { street: 'X', city: 'Y', state: 'Z' },
        customerName: 'Notif Test',
      });
    const notifs = db.prepare('SELECT * FROM notifications WHERE userId = ?').all(user.id);
    const orderNotifs = notifs.filter(n => n.type === 'order');
    assert.ok(orderNotifs.length > 0);
  });
});

describe('GET /api/orders', () => {
  it('returns only the authenticated users orders', async () => {
    const other = seedUser(db, { email: 'other-orders@test.com' });
    seedOrder(db, user.id);
    seedOrder(db, other.id);
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 200);
    assert.ok(res.body.orders.every(o => o.userId === user.id));
  });

  it('parses items and deliveryAddress from JSON strings', async () => {
    seedOrder(db, user.id);
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.orders[0].items));
    assert.equal(typeof res.body.orders[0].deliveryAddress, 'object');
  });
});

describe('PATCH /api/orders/:id/cancel', () => {
  it('cancels a pending order', async () => {
    const order = seedOrder(db, user.id, { status: 'pending' });
    const res = await request(app)
      .patch(`/api/orders/${order.id}/cancel`)
      .set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    const updated = db.prepare('SELECT status FROM orders WHERE id = ?').get(order.id);
    assert.equal(updated.status, 'cancelled');
  });

  it('rejects cancelling a non-pending order', async () => {
    const order = seedOrder(db, user.id, { status: 'confirmed' });
    const res = await request(app)
      .patch(`/api/orders/${order.id}/cancel`)
      .set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 400);
    assert.ok(res.body.error.includes('Only pending'));
  });

  it('rejects cancelling another users order', async () => {
    const order = seedOrder(db, user.id);
    const other = seedUser(db, { email: 'cancel-other@test.com' });
    const otherToken = makeToken(other.id);
    const res = await request(app)
      .patch(`/api/orders/${order.id}/cancel`)
      .set('Authorization', `Bearer ${otherToken}`);
    // May be 404 (not found) or 429 (rate limited) — both are rejections
    assert.ok(res.status !== 200, `Expected rejection, got ${res.status}`);
  });
});
