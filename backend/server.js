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
const PORT = process.env.PORT || 8001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/multlang-news-hub';

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

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
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Initialize RSS feeds on startup
async function initializeFeeds() {
  try {
    console.log('🔄 Initializing RSS feeds...');
    
    // Fetch all sources on startup
    const { RSS_SOURCES } = await import('./constants/sources.js');
    const allSources = Object.values(RSS_SOURCES).flat();
    
    for (const source of allSources) {
      try {
        await rssService.refreshSource(source.id);
        console.log(`✅ Initialized ${source.label}`);
      } catch (error) {
        console.error(`❌ Failed to initialize ${source.label}:`, error.message);
      }
    }
    
    console.log('✅ RSS feeds initialization completed');
  } catch (error) {
    console.error('❌ Error initializing feeds:', error);
  }
}

// Start background refresh scheduler
function startScheduler() {
  // Refresh every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    console.log('🔄 Running scheduled RSS refresh...');
    
    const { RSS_SOURCES } = await import('./constants/sources.js');
    const allSources = Object.values(RSS_SOURCES).flat();
    
    for (const source of allSources) {
      try {
        await rssService.refreshSource(source.id);
        console.log(`✅ Refreshed ${source.label}`);
      } catch (error) {
        console.error(`❌ Failed to refresh ${source.label}:`, error.message);
      }
    }
  });
  
  console.log('✅ Background scheduler started (every 15 minutes)');
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  
  rssService.stopBackgroundRefresh();
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  
  rssService.stopBackgroundRefresh();
  await mongoose.connection.close();
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    await connectDB();
    await initializeFeeds();
    startScheduler();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📰 MultiLang News Hub API ready`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();


