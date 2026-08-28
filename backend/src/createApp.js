const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const mealRoutes = require('./routes/meals');
const favoriteRoutes = require('./routes/favorites');
const addressRoutes = require('./routes/addresses');
const notificationRoutes = require('./routes/notifications');
const walletRoutes = require('./routes/wallet');
const adminRoutes = require('./routes/admin');

const path = require('path');
const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:5174').split(',').map(s => s.trim());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Security headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Rate limiting on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting on order creation
const orderLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.ORDER_RATE_LIMIT_MAX) || 10,
  message: { error: 'Too many order requests, please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/orders', orderLimiter, orderRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/*', (_req, res) => res.status(404).json({ error: 'API route not found' }));

module.exports = app;
