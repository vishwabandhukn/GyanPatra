import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';

// Load environment variables
dotenv.config();

// Import routes and services
import apiRoutes from './routes/api.js';
import rssService from './services/rssService.js';

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 8001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/multlang-news-hub';

// ---------------- Robust CORS middleware ----------------
// Allow localhost during dev and the production CLIENT_URI (if set).
// Normalize origins (remove trailing slash) and echo the exact request origin
// when allowed — prevents trailing-slash mismatch issues.
const devOrigins = ['http://localhost:5173', 'http://localhost:3000'];
const prodOrigin = process.env.CLIENT_URI; // note: you're using CLIENT_URI in env
const allowedOrigins = [...devOrigins, prodOrigin].filter(Boolean).map(o => String(o).replace(/\/+$/, ''));

app.use((req, res, next) => {
  const originHeader = req.headers.origin;
  if (!originHeader) {
    // Non-browser clients (curl, server-to-server) — allow
    return next();
  }

  const normalizedOrigin = originHeader.replace(/\/+$/, '');

  // Debug log for CORS issues
  if (!allowedOrigins.includes(normalizedOrigin)) {
    console.warn(`[CORS] Request blocked from origin: '${originHeader}'`);
    console.warn(`[CORS] Allowed origins:`, allowedOrigins);
  }

  if (allowedOrigins.includes(normalizedOrigin)) {
    // Echo the exact origin the browser sent so it matches exactly
    res.setHeader('Access-Control-Allow-Origin', originHeader);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  }

  // Handle preflight quickly
  if (req.method === 'OPTIONS') return res.sendStatus(204);

  next();
});

// Keep the cors package (optional) — origin:true will allow the already-set header to be used
app.use(cors({ origin: true, credentials: true }));
// -------------------------------------------------------


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'MultiLang News Hub API',
    version: '1.0.0',
    endpoints: {
      sources: '/api/sources',
      news: '/api/news?sourceId=... or ?language=...',
      refresh: '/api/refresh?sourceId=...',
      health: '/api/health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Background Job - Schedule RSS refresh every 15 minutes
// This runs in the background and does NOT block the server
cron.schedule('*/15 * * * *', async () => {
  console.log('🔄 [Cron] Starting scheduled RSS refresh...');
  try {
    await rssService.refreshAllSources();
    console.log('✅ [Cron] Scheduled RSS refresh completed');
  } catch (error) {
    console.error('❌ [Cron] Scheduled RSS refresh failed:', error);
  }
});

// Start server
async function startServer() {
  try {
    // Database connection must happen before we accept requests
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📰 MultiLang News Hub API ready`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);

      // OPTIONAL: Trigger an initial fetch in the background (fire and forget)
      // purely to populate data if DB is empty, without blocking startup
      console.log('🔄 triggering initial background fetch (non-blocking)...');
      rssService.refreshAllSources().catch(err => console.error('Initial background fetch error:', err));
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
