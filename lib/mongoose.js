const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // Increased for stability on cold starts
      connectTimeoutMS: 20000,         // Time to wait for initial connection
      maxPoolSize: 1,                 // Best for Vercel (one connection per lambda)
    };

    console.log('--- Database: Checking environment variables... ---');
    if (!process.env.MONGO_URI) {
      console.error('CRITICAL: MONGO_URI is not defined in .env!');
      throw new Error('Database configuration missing.');
    }

    console.log('--- Database: Attempting fresh connection... ---');
    cached.promise = mongoose.connect(process.env.MONGO_URI, opts)
      .then((mongoose) => {
        console.log('--- Database: Successfully Connected to MongoDB Atlas ---');
        return mongoose;
      })
      .catch((err) => {
        console.error('--- Database: Connection Failed! ---');
        if (err.message.includes('whitelist')) {
          console.error('HINT: Check your MongoDB Atlas Network Access IP Whitelist.');
        } else if (err.message.includes('Authentication failed')) {
          console.error('HINT: Check DATABASE_USER and PASSWORD in your .env file.');
        } else {
          console.error(`ERROR DETAILS: ${err.message}`);
        }
        cached.promise = null; // Reset promise so we can try again on next request
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    throw err;
  }
}

module.exports = connectDB;