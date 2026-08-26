const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { resetTestDb, loadApp, getDb, seedUser } = require('./helpers');

let app, db;

before(() => {
  resetTestDb();
  app = loadApp();
  db = getDb();
});

after(() => { resetTestDb(); });

describe('POST /api/auth/signup', () => {
  it('creates a new user and returns token', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Alice', email: 'alice@test.com', password: 'password123' });
    assert.equal(res.status, 201);
    assert.ok(res.body.token);
    assert.equal(res.body.user.name, 'Alice');
    assert.equal(res.body.user.email, 'alice@test.com');
    assert.equal(res.body.user.role, 'user');
  });

  it('rejects duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Alice2', email: 'alice@test.com', password: 'password123' });
    assert.equal(res.status, 409);
    assert.ok(res.body.error.includes('already exists'));
  });

  it('rejects missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Bob' });
    assert.equal(res.status, 400);
  });

  it('rejects short password (<8 chars)', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Short', email: 'short@test.com', password: '1234567' });
    assert.equal(res.status, 400);
    assert.ok(res.body.error.includes('8 characters'));
  });

  it('accepts exactly 8 character password', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Eight', email: 'eight@test.com', password: '12345678' });
    assert.equal(res.status, 201);
  });

  it('creates admin when valid ADMIN_CODE provided', async () => {
    process.env.ADMIN_CODE = 'test-admin-code';
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Admin', email: 'admin@test.com', password: 'password123', adminCode: 'test-admin-code' });
    assert.equal(res.status, 201);
    assert.equal(res.body.user.role, 'admin');
    delete process.env.ADMIN_CODE;
  });

  it('creates regular user with wrong admin code', async () => {
    process.env.ADMIN_CODE = 'correct-code';
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'NotAdmin', email: 'notadmin@test.com', password: 'password123', adminCode: 'wrong' });
    assert.equal(res.status, 201);
    assert.equal(res.body.user.role, 'user');
    delete process.env.ADMIN_CODE;
  });

  it('normalizes email to lowercase', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Case', email: 'CASE@TEST.COM', password: 'password123' });
    assert.equal(res.status, 201);
    assert.equal(res.body.user.email, 'case@test.com');
  });
});

describe('POST /api/auth/login', () => {
  it('returns token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@test.com', password: 'password123' });
    assert.equal(res.status, 200);
    assert.ok(res.body.token);
    assert.equal(res.body.user.email, 'alice@test.com');
  });

  it('rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@test.com', password: 'wrongpassword' });
    assert.equal(res.status, 401);
    assert.ok(res.body.error.includes('Incorrect password'));
  });

  it('rejects non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'password123' });
    assert.equal(res.status, 401);
    assert.ok(res.body.error.includes('No account found'));
  });

  it('rejects missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@test.com' });
    assert.equal(res.status, 400);
  });

  it('normalizes email on login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ALICE@TEST.COM', password: 'password123' });
    assert.equal(res.status, 200);
  });
});

describe('GET /api/auth/me', () => {
  it('returns current user profile', async () => {
    const user = seedUser(db);
    const token = require('./helpers').makeToken(user.id);
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.user.id, user.id);
    assert.equal(res.body.user.name, user.name);
  });

  it('rejects request without token', async () => {
    const res = await request(app).get('/api/auth/me');
    assert.equal(res.status, 401);
  });

  it('rejects invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token');
    assert.equal(res.status, 401);
  });
});

describe('PUT /api/auth/profile', () => {
  it('updates user name', async () => {
    const user = seedUser(db);
    const token = require('./helpers').makeToken(user.id);
    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Name' });
    assert.equal(res.status, 200);
    assert.equal(res.body.user.name, 'Updated Name');
  });

  it('updates phone', async () => {
    const user = seedUser(db);
    const token = require('./helpers').makeToken(user.id);
    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ phone: '+2348012345678' });
    assert.equal(res.status, 200);
    assert.equal(res.body.user.phone, '+2348012345678');
  });

  it('rejects empty update', async () => {
    const user = seedUser(db);
    const token = require('./helpers').makeToken(user.id);
    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    assert.equal(res.status, 400);
  });
});
