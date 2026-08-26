const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const path = require('path');
const fs = require('fs');
const { resetTestDb, loadApp, getDb, seedUser, seedMeal, seedOrder, makeToken } = require('./helpers');

let app, db, admin, user, adminToken, userToken;

before(() => {
  resetTestDb();
  app = loadApp();
  db = getDb();
  admin = seedUser(db, { email: 'admin-crud@test.com', role: 'admin' });
  user = seedUser(db, { email: 'user-crud@test.com', role: 'user' });
  adminToken = makeToken(admin.id);
  userToken = makeToken(user.id);
});

after(() => { resetTestDb(); });

describe('POST /api/admin/meals', () => {
  it('admin can create a meal with JSON body (no file)', async () => {
    const res = await request(app)
      .post('/api/admin/meals')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'New Meal',
        description: 'Delicious',
        price: 2500,
        category: 'Snacks',
        image: '/uploads/new.jpg',
      });
    assert.equal(res.status, 201);
    assert.equal(res.body.meal.name, 'New Meal');
    assert.equal(res.body.meal.price, 2500);
  });

  it('rejects missing required fields', async () => {
    const res = await request(app)
      .post('/api/admin/meals')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Incomplete' });
    assert.equal(res.status, 400);
  });

  it('rejects non-admin', async () => {
    const res = await request(app)
      .post('/api/admin/meals')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'X', description: 'Y', price: 1000, category: 'Z', image: '/img.jpg' });
    assert.equal(res.status, 403);
  });
});

describe('PUT /api/admin/meals/:id', () => {
  it('admin can update a meal', async () => {
    const meal = seedMeal(db, { id: 'update-meal-1', name: 'Original' });
    const res = await request(app)
      .put(`/api/admin/meals/${meal.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Meal', price: 5000 });
    assert.equal(res.status, 200);
    assert.equal(res.body.meal.name, 'Updated Meal');
    assert.equal(res.body.meal.price, 5000);
  });

  it('returns 404 for non-existent meal', async () => {
    const res = await request(app)
      .put('/api/admin/meals/non-existent')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'X' });
    assert.equal(res.status, 404);
  });
});

describe('DELETE /api/admin/meals/:id', () => {
  it('admin can delete a meal', async () => {
    const meal = seedMeal(db, { id: 'delete-meal-1' });
    const res = await request(app)
      .delete(`/api/admin/meals/${meal.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(res.status, 200);
    const found = db.prepare('SELECT * FROM meals WHERE id = ?').get(meal.id);
    assert.equal(found, undefined);
  });
});

describe('PUT /api/admin/orders/:id/status', () => {
  it('admin can update order status', async () => {
    const order = seedOrder(db, user.id, { status: 'pending' });
    const res = await request(app)
      .put(`/api/admin/orders/${order.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'confirmed' });
    assert.equal(res.status, 200);
    const updated = db.prepare('SELECT status FROM orders WHERE id = ?').get(order.id);
    assert.equal(updated.status, 'confirmed');
  });

  it('rejects invalid status value', async () => {
    const order = seedOrder(db, user.id);
    const res = await request(app)
      .put(`/api/admin/orders/${order.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'hacked' });
    assert.equal(res.status, 400);
  });

  it('returns 404 for non-existent order', async () => {
    const res = await request(app)
      .put('/api/admin/orders/fake-id/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'confirmed' });
    assert.equal(res.status, 404);
  });
});

describe('PUT /api/admin/users/:id/role', () => {
  it('admin can change user role', async () => {
    const target = seedUser(db, { email: 'role-target@test.com' });
    const res = await request(app)
      .put(`/api/admin/users/${target.id}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'admin' });
    assert.equal(res.status, 200);
    const updated = db.prepare('SELECT role FROM users WHERE id = ?').get(target.id);
    assert.equal(updated.role, 'admin');
  });

  it('rejects invalid role', async () => {
    const target = seedUser(db, { email: 'role-invalid@test.com' });
    const res = await request(app)
      .put(`/api/admin/users/${target.id}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'superuser' });
    assert.equal(res.status, 400);
  });
});

describe('GET /api/admin/orders', () => {
  it('returns all orders for admin', async () => {
    seedOrder(db, user.id);
    seedOrder(db, admin.id);
    const res = await request(app)
      .get('/api/admin/orders')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(res.status, 200);
    assert.ok(res.body.orders.length >= 2);
  });
});

describe('GET /api/admin/users', () => {
  it('returns all users for admin', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(res.status, 200);
    assert.ok(res.body.users.length >= 2);
  });
});
