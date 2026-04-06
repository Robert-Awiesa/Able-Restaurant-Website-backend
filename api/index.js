const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests

// Connect to MongoDB (Serverless compatible)
let isConnected;
const connectDB = async () => {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000 // 5 seconds max wait before failing
    });
    isConnected = db.connections[0].readyState;
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    throw err;
  }
};

// Apply DB connection requirement to all routes
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Routes
const orderRoutes = require('../routes/orders');
app.use('/api/orders', orderRoutes);

const authRoutes = require('../routes/auth');
app.use('/api/auth', authRoutes);

// Simple health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend is running' });
});

// Root route so browser doesn't show "Cannot GET /"
app.get('/', (req, res) => {
  res.send('Able Restaurant API is running perfectly!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Export the Express API for Vercel Serverless Functions
module.exports = app;
