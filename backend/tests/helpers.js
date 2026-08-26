const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = 'test-secret-key-for-ci';
const TEST_DB = process.env.DB_PATH || path.join(__dirname, '..', 'test-data.db');

function resetTestDb() {
  try { fs.unlinkSync(TEST_DB); } catch {}
  try { fs.unlinkSync(TEST_DB + '-wal'); } catch {}
  try { fs.unlinkSync(TEST_DB + '-shm'); } catch {}
}

function loadApp() {
  // Set env before requiring anything
  process.env.DB_PATH = TEST_DB;
  process.env.JWT_SECRET = JWT_SECRET;
  process.env.ALLOWED_ORIGINS = 'http://localhost:5173';

  // Clear ALL cached modules under the backend src/ to get fresh DB connection
  const backendPrefix = path.join(__dirname, '..', 'src');
  const modules = Object.keys(require.cache).filter(m => m.startsWith(backendPrefix));
  modules.forEach(m => delete require.cache[m]);

  const app = require('../src/createApp');
  return app;
}

function makeToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
}

function getDb() {
  return require('../src/db');
}

function seedUser(db, overrides = {}) {
  const id = overrides.id || uuidv4();
  const name = overrides.name || 'Test User';
  const email = overrides.email || `test${Date.now()}${Math.random().toString(36).slice(2,6)}@example.com`;
  const password = overrides.password || 'password123';
  const role = overrides.role || 'user';
  const hashed = bcrypt.hashSync(password, 10);
  db.prepare('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)').run(id, name, email.toLowerCase(), hashed, role);
  return { id, name, email: email.toLowerCase(), password, role };
}

function seedMeal(db, overrides = {}) {
  const id = overrides.id || `meal-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
  const name = overrides.name || 'Test Meal';
  const description = overrides.description || 'A test meal';
  const price = overrides.price || 3000;
  const category = overrides.category || 'Main Dishes';
  const image = overrides.image || '/uploads/test.jpg';
  const discount = overrides.discount || 0;
  const isNew = overrides.isNew || 0;
  db.prepare('INSERT INTO meals (id, name, description, price, category, image, discount, isNew) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, name, description, price, category, image, discount, isNew);
  return { id, name, description, price, category, image, discount, isNew };
}

function seedOrder(db, userId, overrides = {}) {
  const id = overrides.id || uuidv4();
  const items = overrides.items || [{ id: 'm1', name: 'Jollof Rice', quantity: 2, price: 4500 }];
  const total = overrides.total || 9000;
  const finalTotal = overrides.finalTotal || total;
  const status = overrides.status || 'pending';
  const deliveryAddress = overrides.deliveryAddress || { street: '123 Test St', city: 'Lagos', state: 'Lagos' };
  const customerName = overrides.customerName || 'Test Customer';
  db.prepare('INSERT INTO orders (id, userId, items, total, finalTotal, status, deliveryAddress, customerName) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, userId, JSON.stringify(items), total, finalTotal, status, JSON.stringify(deliveryAddress), customerName);
  return { id, userId, items, total, finalTotal, status };
}

function seedNotification(db, userId, overrides = {}) {
  const id = overrides.id || uuidv4();
  const type = overrides.type || 'general';
  const title = overrides.title || 'Test Notification';
  const message = overrides.message || 'Test message';
  const read = overrides.read || 0;
  db.prepare('INSERT INTO notifications (id, userId, type, title, message, read) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, userId, type, title, message, read);
  return { id, userId, type, title, message, read };
}

module.exports = {
  JWT_SECRET,
  TEST_DB,
  resetTestDb,
  loadApp,
  makeToken,
  getDb,
  seedUser,
  seedMeal,
  seedOrder,
  seedNotification,
};
