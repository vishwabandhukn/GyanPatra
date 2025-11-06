import express from 'express';
import rateLimit from 'express-rate-limit';
import rssService from '../services/rssService.js';
import { RSS_SOURCES, LANGUAGES } from '../constants/sources.js';

const router = express.Router();

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const refreshLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit each IP to 10 refresh requests per 5 minutes
  message: 'Too many refresh requests, please try again later.'
});

router.use(apiLimiter);

// GET /api/sources - Get all available sources grouped by language
router.get('/sources', async (req, res) => {
  try {
    const sourcesByLanguage = {};
    
    LANGUAGES.forEach(lang => {
      sourcesByLanguage[lang.id] = {
        language: lang,
        sources: RSS_SOURCES[lang.id] || []
      };
    });

    res.json({
      success: true,
      data: sourcesByLanguage
    });
  } catch (error) {
    console.error('Error fetching sources:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sources'
    });
  }
});

// GET /api/news - Get news items by source or language
router.get('/news', async (req, res) => {
  try {
    const { sourceId, language, limit = 50 } = req.query;
    
    let newsItems = [];
    
    if (sourceId) {
      // Get news for specific source
      newsItems = await rssService.getCachedNews(sourceId, parseInt(limit));
    } else if (language) {
      // Get news for specific language
      newsItems = await rssService.getNewsByLanguage(language, parseInt(limit));
    } else {
      return res.status(400).json({
        success: false,
        error: 'Either sourceId or language parameter is required'
      });
    }

    res.json({
      success: true,
      data: newsItems,
      count: newsItems.length
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch news'
    });
  }
});

// POST /api/refresh - Force refresh a specific source
router.post('/refresh', refreshLimiter, async (req, res) => {
  try {
    const { sourceId } = req.query;
    
    if (!sourceId) {
      return res.status(400).json({
        success: false,
        error: 'sourceId parameter is required'
      });
    }

    const source = rssService.findSourceById(sourceId);
    if (!source) {
      return res.status(404).json({
        success: false,
        error: 'Source not found'
      });
    }

    // Refresh the source
    const newItems = await rssService.refreshSource(sourceId);
    
    res.json({
      success: true,
      message: `Successfully refreshed ${sourceId}`,
      newItemsCount: newItems.length
    });
  } catch (error) {
    console.error('Error refreshing source:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh source'
    });
  }
});

// GET /api/health - Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  });
});

export default router;


