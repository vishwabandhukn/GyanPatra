import Parser from 'rss-parser';
import axios from 'axios';
import * as cheerio from 'cheerio';
import sanitizeHtml from 'sanitize-html';
import pLimit from 'p-limit';
import NewsItem from '../models/NewsItem.js';
import { RSS_SOURCES } from '../constants/sources.js';

// Import updated scrapers
import { fetchPrajavaniNews, fetchKannadaPrabhaNews } from './prajavaniService.js';
import { fetchDeccanHeraldNews, fetchNews18HindiNews, fetchLiveHindustanNews } from './additionalScrapers.js';

class RSSService {
  constructor() {
    this.parser = new Parser({
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      }
    });
    // Limit concurrency to 5 parallel requests to avoid overloading network/memory
    this.limit = pLimit(5);
  }

  sanitizeContent(html) {
    if (!html) return '';
    return sanitizeHtml(html, {
      allowedTags: ['p', 'br', 'strong', 'em', 'a', 'ul', 'ol', 'li'],
      allowedAttributes: { 'a': ['href', 'target'] }
    });
  }

  normalizeItem(item, sourceId, language) {
    const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date();
    return {
      sourceId,
      language,
      title: item.title || 'No Title',
      description: this.sanitizeContent(item.contentSnippet || item.description || ''),
      link: item.link || '',
      publishedAt,
      guid: item.guid || item.link,
      categories: item.categories || [],
      author: item.creator || item.author || '',
      imageUrl: item.enclosure?.url || this.extractImageFromContent(item.content),
      content: this.sanitizeContent(item.content || item.description || '')
    };
  }

  extractImageFromContent(content) {
    if (!content) return null;
    const $ = cheerio.load(content);
    const img = $('img').first();
    return img.attr('src') || null;
  }

  async fetchFeed(feedUrl, sourceId, language, type = 'rss') {
    try {
      if (type === 'scraper') {
        if (sourceId === 'prajavani') return await this.scrapePrajavani(sourceId, language);
        if (sourceId === 'kannada-prabha') return await this.scrapeKannadaPrabha(sourceId, language);
        if (sourceId === 'deccan-herald') return await this.scrapeDeccanHerald(sourceId, language);
        if (sourceId === 'news18-hindi') return await this.scrapeNews18Hindi(sourceId, language);
        if (sourceId === 'live-hindustan') return await this.scrapeLiveHindustan(sourceId, language);
      }

      // Normal RSS feed
      console.log(`Fetching RSS feed: ${feedUrl}`);

      // Use Axios for the request to ensure headers are sent correctly (bypassing 403s)
      const response = await axios.get(feedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        timeout: 10000
      });

      const feed = await this.parser.parseString(response.data);
      const normalizedItems = feed.items.map(item => this.normalizeItem(item, sourceId, language));

      await this.saveItems(normalizedItems);
      console.log(`✅ Successfully fetched ${normalizedItems.length} items from ${sourceId}`);
      return normalizedItems;

    } catch (error) {
      // Log detailed error for debugging
      const status = error.response ? error.response.status : 'Unknown';
      console.error(`❌ Error fetching feed ${feedUrl}: Status ${status} - ${error.message}`);
      return [];
    }
  }

  // --- Custom scraper for Prajavani ---
  async scrapePrajavani(sourceId, language) {
    try {
      const scrapedItems = await fetchPrajavaniNews();
      const normalizedItems = scrapedItems.map(item => this.normalizeItem(item, sourceId, language));
      await this.saveItems(normalizedItems);
      console.log(`✅ Scraped ${normalizedItems.length} items from Prajavani`);
      return normalizedItems;
    } catch (err) {
      console.error('❌ Error scraping Prajavani:', err.message);
      return [];
    }
  }

  // --- Custom scraper for Kannada Prabha ---
  async scrapeKannadaPrabha(sourceId, language) {
    try {
      const scrapedItems = await fetchKannadaPrabhaNews();
      const normalizedItems = scrapedItems.map(item => this.normalizeItem(item, sourceId, language));
      await this.saveItems(normalizedItems);
      console.log(`✅ Scraped ${normalizedItems.length} items from Kannada Prabha`);
      return normalizedItems;
    } catch (err) {
      console.error('❌ Error scraping Kannada Prabha:', err.message);
      return [];
    }
  }

  // --- Custom scraper for Deccan Herald ---
  async scrapeDeccanHerald(sourceId, language) {
    try {
      const scrapedItems = await fetchDeccanHeraldNews();
      const normalizedItems = scrapedItems.map(item => this.normalizeItem(item, sourceId, language));
      await this.saveItems(normalizedItems);
      console.log(`✅ Scraped ${normalizedItems.length} items from Deccan Herald`);
      return normalizedItems;
    } catch (err) {
      console.error('❌ Error scraping Deccan Herald:', err.message);
      return [];
    }
  }

  // --- Custom scraper for News18 Hindi ---
  async scrapeNews18Hindi(sourceId, language) {
    try {
      const scrapedItems = await fetchNews18HindiNews();
      const normalizedItems = scrapedItems.map(item => this.normalizeItem(item, sourceId, language));
      await this.saveItems(normalizedItems);
      console.log(`✅ Scraped ${normalizedItems.length} items from News18 Hindi`);
      return normalizedItems;
    } catch (err) {
      console.error('❌ Error scraping News18 Hindi:', err.message);
      return [];
    }
  }

  // --- Custom scraper for Live Hindustan ---
  async scrapeLiveHindustan(sourceId, language) {
    try {
      const scrapedItems = await fetchLiveHindustanNews();
      const normalizedItems = scrapedItems.map(item => this.normalizeItem(item, sourceId, language));
      await this.saveItems(normalizedItems);
      console.log(`✅ Scraped ${normalizedItems.length} items from Live Hindustan`);
      return normalizedItems;
    } catch (err) {
      console.error('❌ Error scraping Live Hindustan:', err.message);
      return [];
    }
  }

  async saveItems(items) {
    if (!items || items.length === 0) return;

    // Create bulk operations
    const bulkOps = items.map(item => ({
      updateOne: {
        filter: { guid: item.guid }, // Check if news with this GUID exists
        update: { $set: item },      // Update content (in case of corrections)
        upsert: true                 // Insert if doesn't exist
      }
    }));

    try {
      if (bulkOps.length > 0) {
        await NewsItem.bulkWrite(bulkOps);
      }
    } catch (error) {
      console.error('Error in bulkWrite:', error.message);
    }
  }

  async getCachedNews(sourceId, limit = 50) {
    return await NewsItem.find({ sourceId }).sort({ publishedAt: -1 }).limit(limit).lean();
  }

  async getNewsByLanguage(language, limit = 50) {
    return await NewsItem.find({ language }).sort({ publishedAt: -1 }).limit(limit).lean();
  }

  async refreshSource(sourceId) {
    const source = this.findSourceById(sourceId);
    if (!source) throw new Error(`Source not found: ${sourceId}`);
    return await this.fetchFeed(source.feedUrl, sourceId, source.language, source.type || 'rss');
  }

  // New Method: Fetch all sources in parallel
  async refreshAllSources() {
    const allSources = [];
    for (const lang in RSS_SOURCES) {
      allSources.push(...RSS_SOURCES[lang]);
    }

    console.log(`🔄 Starting refresh for ${allSources.length} sources...`);

    // Map sources to promises with concurrency limit
    const promises = allSources.map(source =>
      this.limit(() =>
        this.fetchFeed(source.feedUrl, source.id, source.language, source.type || 'rss')
          .catch(err => console.error(`Failed to refresh ${source.id}:`, err.message))
      )
    );

    await Promise.all(promises);
    console.log('✅ All sources refreshed.');
  }

  findSourceById(sourceId) {
    for (const lang in RSS_SOURCES) {
      const source = RSS_SOURCES[lang].find(s => s.id === sourceId);
      if (source) return source;
    }
    return null;
  }
}

export default new RSSService();
