const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { resetTestDb, loadApp, getDb, seedUser, seedMeal, seedOrder, makeToken } = require('./helpers');

let app, db, admin, user, meal;

before(() => {
  resetTestDb();
  app = loadApp();
  db = getDb();
  admin = seedUser(db, { email: 'admin-auth@test.com', role: 'admin' });
  user = seedUser(db, { email: 'user-auth@test.com', role: 'user' });
  meal = seedMeal(db, { id: 'auth-meal-1' });
});

after(() => { resetTestDb(); });

describe('Unauthenticated access denied', () => {
  it('GET /api/orders requires auth', async () => {
    const res = await request(app).get('/api/orders');
    assert.equal(res.status, 401);
  });

  it('POST /api/orders requires auth', async () => {
    const res = await request(app).post('/api/orders').send({ items: [] });
    assert.equal(res.status, 401);
  });

  it('GET /api/wallet requires auth', async () => {
    const res = await request(app).get('/api/wallet');
    assert.equal(res.status, 401);
  });

  it('GET /api/notifications requires auth', async () => {
    const res = await request(app).get('/api/notifications');
    assert.equal(res.status, 401);
  });

  it('GET /api/addresses requires auth', async () => {
    const res = await request(app).get('/api/addresses');
    assert.equal(res.status, 401);
  });

  it('GET /api/favorites requires auth', async () => {
    const res = await request(app).get('/api/favorites');
    assert.equal(res.status, 401);
  });
});

describe('Admin routes reject regular users', () => {
  const userToken = makeToken(user.id);

  it('GET /api/admin/orders returns 403 for user', async () => {
    const res = await request(app)
      .get('/api/admin/orders')
      .set('Authorization', `Bearer ${userToken}`);
    assert.equal(res.status, 403);
  });

  it('GET /api/admin/users returns 403 for user', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${userToken}`);
    assert.equal(res.status, 403);
  });

  it('POST /api/admin/meals returns 403 for user', async () => {
    const res = await request(app)
      .post('/api/admin/meals')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'X', description: 'Y', price: 1000, category: 'Z', image: '/img.jpg' });
    assert.equal(res.status, 403);
  });

  it('PUT /api/admin/orders/anything/status returns 403 for user', async () => {
    const res = await request(app)
      .put('/api/admin/orders/fake-id/status')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: 'confirmed' });
    assert.equal(res.status, 403);
  });

  it('PUT /api/admin/users/anything/role returns 403 for user', async () => {
    const res = await request(app)
      .put('/api/admin/users/fake-id/role')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ role: 'admin' });
    assert.equal(res.status, 403);
  });

  it('DELETE /api/admin/meals/anything returns 403 for user', async () => {
    const res = await request(app)
      .delete('/api/admin/meals/fake-id')
      .set('Authorization', `Bearer ${userToken}`);
    assert.equal(res.status, 403);
  });
});

describe('Admin routes accept admin users', () => {
  const adminToken = makeToken(admin.id);

  it('GET /api/admin/orders returns 200 for admin', async () => {
    const res = await request(app)
      .get('/api/admin/orders')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.orders));
  });

  it('GET /api/admin/users returns 200 for admin', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.users));
  });
});

describe('User can only access own orders', () => {
  it('user cannot see another users order by id', async () => {
    const order = seedOrder(db, user.id);
    const otherUser = seedUser(db, { email: 'other@test.com' });
    const otherToken = makeToken(otherUser.id);
    const res = await request(app)
      .get(`/api/orders/${order.id}`)
      .set('Authorization', `Bearer ${otherToken}`);
    assert.equal(res.status, 404);
  });

  it('user can see own order by id', async () => {
    const order = seedOrder(db, user.id);
    const userToken = makeToken(user.id);
    const res = await request(app)
      .get(`/api/orders/${order.id}`)
      .set('Authorization', `Bearer ${userToken}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.order.id, order.id);
  });
});
