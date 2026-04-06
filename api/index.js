const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());
app.use(express.json());

// ── MongoDB connection (cached across Vercel serverless invocations) ──────────
let cachedConn = null;

async function connectDB() {
  // If already connected, reuse it
  if (cachedConn && mongoose.connection.readyState === 1) return cachedConn;

  // Disconnect stale connection states (connecting / disconnecting)
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  cachedConn = await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 8000,
    connectTimeoutMS: 8000,
    maxPoolSize: 1          // Minimal pool for serverless
  });

  console.log('MongoDB connected');
  return cachedConn;
}

// ── Health / root (no DB needed) ─────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'OK', dbState: mongoose.connection.readyState }));
app.get('/',           (req, res) => res.send('Able Restaurant API is running!'));

// ── DB middleware (only for data routes below) ────────────────────────────────
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB connection error:', err.message);
    return res.status(500).json({ error: 'Database connection failed', detail: err.message });
  }
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/orders', require('../routes/orders'));
app.use('/api/auth',   require('../routes/auth'));

// ── Local dev server (Vercel ignores this) ────────────────────────────────────
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });
}

module.exports = app;
