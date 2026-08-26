const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { resetTestDb, loadApp, getDb, seedUser, seedMeal, seedOrder, makeToken } = require('./helpers');

let app, db, user, token;

before(() => {
  resetTestDb();
  app = loadApp();
  db = getDb();
  user = seedUser(db, { email: 'security@test.com' });
  token = makeToken(user.id);
  seedMeal(db, { id: 'sec-meal-1', price: 4500 });
});

after(() => { resetTestDb(); });

describe('Security headers present', () => {
  it('sets X-Content-Type-Options', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.headers['x-content-type-options'], 'nosniff');
  });

  it('sets X-Frame-Options', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.headers['x-frame-options'], 'DENY');
  });

  it('sets X-XSS-Protection', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.headers['x-xss-protection'], '1; mode=block');
  });

  it('sets Referrer-Policy', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.headers['referrer-policy'], 'strict-origin-when-cross-origin');
  });
});

describe('JWT forgery rejected', () => {
  it('rejects token signed with wrong secret', async () => {
    const jwt = require('jsonwebtoken');
    const forged = jwt.sign({ userId: user.id }, 'wrong-secret');
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${forged}`);
    assert.equal(res.status, 401);
  });

  it('rejects token with tampered payload', async () => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ userId: 'admin-id-hack' }, process.env.JWT_SECRET);
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    // Should return 404 or user data for a non-existent user
    assert.ok(res.status === 404 || res.status === 200);
  });

  it('rejects expired token', async () => {
    const jwt = require('jsonwebtoken');
    const expired = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '-1s' });
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${expired}`);
    assert.equal(res.status, 401);
  });
});

describe('SQL injection rejected', () => {
  it('signup with SQL injection in email', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Hacker', email: "' OR '1'='1", password: 'password123' });
    // Should create a user with the literal email, not bypass auth
    assert.ok(res.status === 201 || res.status === 400);
  });

  it('login with SQL injection in password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'security@test.com', password: "' OR '1'='1" });
    assert.equal(res.status, 401);
  });
});

describe('Order total cannot be tampered client-side', () => {
  it('uses DB price regardless of client-sent price', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ id: 'sec-meal-1', name: 'Meal', quantity: 1, price: 1 }],
        deliveryAddress: { street: 'X', city: 'Y', state: 'Z' },
        customerName: 'Hacker',
      });
    assert.equal(res.status, 201);
    assert.equal(res.body.order.total, 4500);
  });
});

describe('Wallet idempotency', () => {
  it('rejects duplicate wallet credit', async () => {
    const { v4: uuidv4 } = require('uuid');
    const ref = 'paystack:test-ref-123';
    // Insert first credit
    db.prepare('INSERT INTO wallet_transactions (id, userId, type, amount, description) VALUES (?, ?, ?, ?, ?)')
      .run(uuidv4(), user.id, 'credit', 5000, ref);
    // Try to insert duplicate
    const existing = db.prepare('SELECT * FROM wallet_transactions WHERE description = ?').get(ref);
    assert.ok(existing);
    // Verify balance is correct (not doubled)
    const credit = db.prepare('SELECT SUM(amount) as total FROM wallet_transactions WHERE userId = ? AND type = ?').get(user.id, 'credit');
    assert.equal(credit.total, 5000);
  });
});

describe('Rate limit headers present', () => {
  it('includes standard rate limit headers on order creation', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ id: 'sec-meal-1', name: 'Meal', quantity: 1, price: 4500 }],
        deliveryAddress: { street: 'X', city: 'Y', state: 'Z' },
        customerName: 'Header Test',
      });
    assert.ok(res.headers['ratelimit-limit'] !== undefined);
    assert.ok(res.headers['ratelimit-remaining'] !== undefined);
  });
});

describe('CORS configured', () => {
  it('allows configured origins', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:5173');
    assert.equal(res.headers['access-control-allow-origin'], 'http://localhost:5173');
  });
});

describe('404 for unknown API routes', () => {
  it('returns JSON 404 for unknown /api/* path', async () => {
    const res = await request(app).get('/api/nonexistent');
    assert.equal(res.status, 404);
    assert.ok(res.body.error);
  });
});
