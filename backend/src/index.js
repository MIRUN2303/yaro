require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── MIDDLEWARE ───
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  referrerPolicy: { policy: 'same-origin' },
  xFrameOptions: { action: 'deny' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:"],
      fontSrc: ["'self'", "https:", "data:"],
      connectSrc: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  }
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

app.use(morgan('short'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── RATE LIMITING ───
// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, try again later' }
});
app.use('/api/', apiLimiter);

// Strict rate limit on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, try again later' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/admin/login', authLimiter);

// ─── ADMIN DASHBOARD (hidden behind configurable path) ───
const ADMIN_PATH = process.env.ADMIN_PATH || 'admin-secret-' + Math.random().toString(36).slice(2, 10);
console.log('Admin path: /' + ADMIN_PATH);
app.use('/' + ADMIN_PATH, express.static(path.join(__dirname, '..', 'admin'), { dotfiles: 'deny' }));

// Admin login page redirect (hide the real path)
app.get('/admin', (req, res) => {
  res.status(404).send('Not found');
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), { dotfiles: 'deny' }));

// ─── API ROUTES ───
const collectionsRouter = require('./routes/collections');
const storiesRouter = require('./routes/stories');
const productsRouter = require('./routes/products');
const cartRouter = require('./routes/cart');
const ordersRouter = require('./routes/orders');
const authRouter = require('./routes/auth');
const paymentsRouter = require('./routes/payments');
const uploadRouter = require('./routes/upload');

app.use('/api/collections', collectionsRouter);
app.use('/api/stories', storiesRouter);
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/auth', authRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/upload', uploadRouter);

// ─── HEALTH CHECK ───
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 CATCH ───
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ─── ERROR HANDLING ───
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── START ───
app.listen(PORT, () => {
  console.log(`YARO backend running on port ${PORT}`);
  console.log(`Admin dashboard: http://localhost:${PORT}/${ADMIN_PATH}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
