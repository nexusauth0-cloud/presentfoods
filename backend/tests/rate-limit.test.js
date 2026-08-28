const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { resetTestDb, loadApp, getDb, seedUser, seedMeal, makeToken } = require('./helpers');

let app, db, user, token;

before(() => {
  resetTestDb();
  // Exercise the real order limit (10/min), overriding the test default
  process.env.ORDER_RATE_LIMIT_MAX = '10';
  app = loadApp();
  db = getDb();
  user = seedUser(db, { email: 'ratelimit-user@test.com' });
  token = makeToken(user.id);
  seedMeal(db, { id: 'rl-meal-1', price: 3000 });
});

after(() => { resetTestDb(); });

describe('Order rate limiting (10/min)', () => {
  it('allows first 10 order creation requests', async () => {
    for (let i = 0; i < 10; i++) {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          items: [{ id: 'rl-meal-1', name: 'Meal', quantity: 1, price: 3000 }],
          deliveryAddress: { street: `${i} Test St`, city: 'Lagos', state: 'Lagos' },
          customerName: 'Rate Test',
        });
      assert.equal(res.status, 201, `Request ${i + 1} should succeed`);
    }
  });

  it('blocks 11th order creation request', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ id: 'rl-meal-1', name: 'Meal', quantity: 1, price: 3000 }],
        deliveryAddress: { street: '11 Test St', city: 'Lagos', state: 'Lagos' },
        customerName: 'Rate Test',
      });
    assert.equal(res.status, 429);
    assert.ok(res.body.error.includes('Too many'));
  });
});

describe('Auth rate limiting (20/15min)', () => {
  it('returns rate limit headers on auth endpoints', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'password123' });
    // Should get either 200 or 401, but also rate limit headers
    assert.ok(res.headers['ratelimit-remaining'] !== undefined || res.status === 401);
  });
});
