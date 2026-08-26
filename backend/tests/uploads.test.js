const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const path = require('path');
const fs = require('fs');
const { resetTestDb, loadApp, getDb, seedUser, makeToken } = require('./helpers');

let app, db, admin, adminToken;

before(() => {
  resetTestDb();
  app = loadApp();
  db = getDb();
  admin = seedUser(db, { email: 'admin-upload@test.com', role: 'admin' });
  adminToken = makeToken(admin.id);

  // Ensure uploads dir exists
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
});

after(() => { resetTestDb(); });

describe('File upload via POST /api/admin/meals', () => {
  it('accepts JPEG image', async () => {
    const fakeJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
    const res = await request(app)
      .post('/api/admin/meals')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('name', 'JPEG Meal')
      .field('description', 'Has a JPEG')
      .field('price', '3000')
      .field('category', 'Grills')
      .attach('image', fakeJpeg, { filename: 'test.jpg', contentType: 'image/jpeg' });
    assert.equal(res.status, 201);
    assert.ok(res.body.meal.image.includes('/uploads/'));
  });

  it('rejects non-image file (text/plain)', async () => {
    const fakeTxt = Buffer.from('not an image');
    const res = await request(app)
      .post('/api/admin/meals')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('name', 'Text Meal')
      .field('description', 'Has a text file')
      .field('price', '3000')
      .field('category', 'Snacks')
      .attach('image', fakeTxt, { filename: 'hack.txt', contentType: 'text/plain' });
    assert.equal(res.status, 500);
  });

  it('rejects PDF file', async () => {
    const fakePdf = Buffer.from('%PDF-1.4 fake content');
    const res = await request(app)
      .post('/api/admin/meals')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('name', 'PDF Meal')
      .field('description', 'Has a PDF')
      .field('price', '3000')
      .field('category', 'Drinks')
      .attach('image', fakePdf, { filename: 'doc.pdf', contentType: 'application/pdf' });
    assert.equal(res.status, 500);
  });

  it('accepts PNG image', async () => {
    const fakePng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const res = await request(app)
      .post('/api/admin/meals')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('name', 'PNG Meal')
      .field('description', 'Has a PNG')
      .field('price', '3000')
      .field('category', 'Soups')
      .attach('image', fakePng, { filename: 'photo.png', contentType: 'image/png' });
    assert.equal(res.status, 201);
  });
});
