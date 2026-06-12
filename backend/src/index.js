require('dotenv').config();
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
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:5174').split(',').map(s => s.trim());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// Rate limiting on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/*', (_req, res) => res.status(404).json({ error: 'API route not found' }));

app.listen(PORT, () => console.log(`Present Foods API running on port ${PORT}`));
