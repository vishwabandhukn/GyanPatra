import Parser from 'rss-parser';
import axios from 'axios';
import * as cheerio from 'cheerio';
import sanitizeHtml from 'sanitize-html';
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
        'User-Agent': 'MultiLang News Hub Bot 1.0'
      }
    });
    this.refreshIntervals = new Map();
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
      const feed = await this.parser.parseURL(feedUrl);
      const normalizedItems = feed.items.map(item => this.normalizeItem(item, sourceId, language));

      await this.saveItems(normalizedItems);
      console.log(`✅ Successfully fetched ${normalizedItems.length} items from ${sourceId}`);
      return normalizedItems;

    } catch (error) {
      console.error(`❌ Error fetching feed ${feedUrl}:`, error.message);
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
    const bulkOps = items.map(item => ({
      updateOne: {
        filter: { guid: item.guid },
        update: { $set: item },
        upsert: true
      }
    }));

    if (bulkOps.length > 0) await NewsItem.bulkWrite(bulkOps);
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

  findSourceById(sourceId) {
    for (const lang in RSS_SOURCES) {
      const source = RSS_SOURCES[lang].find(s => s.id === sourceId);
      if (source) return source;
    }
    return null;
  }

  startBackgroundRefresh(intervalMinutes = 15) {
    console.log(`Starting background refresh every ${intervalMinutes} minutes`);
    this.clearAllIntervals();

    for (const lang in RSS_SOURCES) {
      RSS_SOURCES[lang].forEach(source => {
        const interval = setInterval(async () => {
          try {
            await this.refreshSource(source.id);
          } catch (error) {
            console.error(`Background refresh failed for ${source.id}:`, error.message);
          }
        }, intervalMinutes * 60 * 1000);

        this.refreshIntervals.set(source.id, interval);
      });
    }
  }

  clearAllIntervals() {
    this.refreshIntervals.forEach(interval => clearInterval(interval));
    this.refreshIntervals.clear();
  }

  stopBackgroundRefresh() {
    this.clearAllIntervals();
    console.log('Background refresh stopped');
  }
}

export default new RSSService();

