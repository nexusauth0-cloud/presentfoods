const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { resetTestDb, loadApp, getDb, seedUser, makeToken } = require('./helpers');

let app, db, user, token;

before(() => {
  resetTestDb();
  app = loadApp();
  db = getDb();
  user = seedUser(db, { email: 'wallet-user@test.com' });
  token = makeToken(user.id);
});

after(() => { resetTestDb(); });

describe('GET /api/wallet', () => {
  it('returns zero balance for new user', async () => {
    const res = await request(app)
      .get('/api/wallet')
      .set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.balance, 0);
    assert.ok(Array.isArray(res.body.transactions));
  });

  it('calculates balance from transactions', async () => {
    const { v4: uuidv4 } = require('uuid');
    db.prepare('INSERT INTO wallet_transactions (id, userId, type, amount, description) VALUES (?, ?, ?, ?, ?)')
      .run(uuidv4(), user.id, 'credit', 5000, 'topup-1');
    db.prepare('INSERT INTO wallet_transactions (id, userId, type, amount, description) VALUES (?, ?, ?, ?, ?)')
      .run(uuidv4(), user.id, 'credit', 3000, 'topup-2');
    db.prepare('INSERT INTO wallet_transactions (id, userId, type, amount, description) VALUES (?, ?, ?, ?, ?)')
      .run(uuidv4(), user.id, 'debit', 2000, 'purchase-1');
    const res = await request(app)
      .get('/api/wallet')
      .set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.balance, 6000);
  });
});

describe('POST /api/wallet/initialize', () => {
  it('rejects amount below minimum', async () => {
    const res = await request(app)
      .post('/api/wallet/initialize')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 50 });
    assert.equal(res.status, 400);
    assert.ok(res.body.error.includes('100'));
  });

  it('rejects missing amount', async () => {
    const res = await request(app)
      .post('/api/wallet/initialize')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    assert.equal(res.status, 400);
  });

  it('rejects unauthenticated request', async () => {
    const res = await request(app)
      .post('/api/wallet/initialize')
      .send({ amount: 1000 });
    assert.equal(res.status, 401);
  });
});

describe('POST /api/wallet/pay', () => {
  it('rejects amount below minimum', async () => {
    const res = await request(app)
      .post('/api/wallet/pay')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 50 });
    assert.equal(res.status, 400);
  });

  it('rejects unauthenticated request', async () => {
    const res = await request(app)
      .post('/api/wallet/pay')
      .send({ amount: 1000 });
    assert.equal(res.status, 401);
  });
});
