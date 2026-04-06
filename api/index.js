const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const orderRoutes = require('./routes/Orders');
// Add your other routes here

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/orders', orderRoutes);
// app.use('/api/auth', authRoutes);
// app.use('/api/menu', menuRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ status: 'API is running' }));

// ── Local dev only (Vercel ignores this block) ────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;