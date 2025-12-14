import express from 'express';
import rateLimit from 'express-rate-limit';
import NodeCache from 'node-cache';
import rssService from '../services/rssService.js';
import { RSS_SOURCES, LANGUAGES } from '../constants/sources.js';

const router = express.Router();
const newsCache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

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
    const cacheKey = 'sources_all';
    const cachedData = newsCache.get(cacheKey);
    if (cachedData) {
      return res.json({ success: true, data: cachedData });
    }

    const sourcesByLanguage = {};

    LANGUAGES.forEach(lang => {
      sourcesByLanguage[lang.id] = {
        language: lang,
        sources: RSS_SOURCES[lang.id] || []
      };
    });

    newsCache.set(cacheKey, sourcesByLanguage, 3600); // Cache sources for 1 hour

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
    const cacheKey = `news_${sourceId || 'all'}_${language || 'all'}_${limit}`;

    const cachedNews = newsCache.get(cacheKey);
    if (cachedNews) {
      // Return cached response instantly
      return res.json({
        success: true,
        data: cachedNews,
        count: cachedNews.length,
        source: 'cache'
      });
    }

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

    newsCache.set(cacheKey, newsItems);

    res.json({
      success: true,
      data: newsItems,
      count: newsItems.length,
      source: 'db'
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
// Made async/non-blocking for performance
router.post('/refresh', refreshLimiter, async (req, res) => {
  try {
    const { sourceId } = req.query;

    if (sourceId) {
      const source = rssService.findSourceById(sourceId);
      if (!source) return res.status(404).json({ success: false, error: 'Source not found' });

      // Trigger background refresh
      rssService.refreshSource(sourceId).then(() => {
        // Invalidate cache for this source
        const keys = newsCache.keys();
        keys.forEach(key => {
          if (key.includes(sourceId) || key.includes(source.language)) newsCache.del(key);
        });
      }).catch(err => console.error(`Manual refresh failed for ${sourceId}`, err));

      return res.json({
        success: true,
        message: `Refresh started for ${sourceId}. Updates will appear shortly.`
      });

    } else {
      // Refresh all
      rssService.refreshAllSources().then(() => {
        newsCache.flushAll();
      }).catch(err => console.error('Manual global refresh failed', err));

      return res.json({
        success: true,
        message: 'Refresh started for all sources. Updates will appear shortly.'
      });
    }

  } catch (error) {
    console.error('Error triggering refresh:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger refresh'
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
