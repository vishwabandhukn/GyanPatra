import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

// Normalize item function
function normalizeItem(item) {
  return {
    title: item.title?.trim() || '',
    link: item.link || '',
    description: item.description?.trim() || '',
    publishedAt: item.publishedAt || new Date().toISOString()
  };
}

// Deccan Herald scraper
export async function fetchDeccanHeraldNews() {
  const url = "https://www.deccanherald.com/";
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.goto(url, { waitUntil: "networkidle2", timeout: 90000 });
    
    const html = await page.content();
    const $ = cheerio.load(html);
    const items = [];
    
    // Try multiple selectors for Deccan Herald
    $("[class*='story'], .headline").each((_, el) => {
      const titleEl = $(el).find("h1, h2, h3, .headline").first();
      const title = titleEl.text().trim() || $(el).text().trim();
      
      // Try different ways to find the link
      const linkEl = $(el).find("a").first();
      const closestLink = $(el).closest("a").attr("href");
      const linkPart = linkEl.attr("href") || closestLink;
      const link = linkPart ? (linkPart.startsWith("http") ? linkPart : "https://www.deccanherald.com" + linkPart) : null;
      
      const description = $(el).find("p, .summary, .excerpt, .description").first().text().trim();
      
      if (title && link && title.length > 10 && !title.includes('Top News')) {
        items.push(normalizeItem({ title, link, description }));
      }
    });
    
    console.log(`✅ Scraped ${items.length} items from Deccan Herald`);
    return items;
    
  } catch (error) {
    console.error('❌ Error scraping Deccan Herald:', error.message);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// News18 Hindi scraper
export async function fetchNews18HindiNews() {
  const url = "https://hindi.news18.com/";
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.goto(url, { waitUntil: "networkidle2", timeout: 90000 });
    
    const html = await page.content();
    const $ = cheerio.load(html);
    const items = [];
    
    // Try multiple selectors for News18 Hindi
    $("[class*='article'], h1, h2, h3").each((_, el) => {
      const titleEl = $(el).find("h1, h2, h3, .headline, .title, .story__title").first();
      const title = titleEl.text().trim() || $(el).text().trim();
      
      // Try different ways to find the link
      const linkEl = $(el).find("a").first();
      const closestLink = $(el).closest("a").attr("href");
      const linkPart = linkEl.attr("href") || closestLink;
      const link = linkPart ? (linkPart.startsWith("http") ? linkPart : "https://hindi.news18.com" + linkPart) : null;
      
      const description = $(el).find("p, .summary, .excerpt, .description, .story__desc").first().text().trim();
      
      if (title && link && title.length > 10 && !title.includes('Top Hindi News') && !title.includes('और भी पढ़ें')) {
        items.push(normalizeItem({ title, link, description }));
      }
    });
    
    console.log(`✅ Scraped ${items.length} items from News18 Hindi`);
    return items;
    
  } catch (error) {
    console.error('❌ Error scraping News18 Hindi:', error.message);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Live Hindustan scraper
export async function fetchLiveHindustanNews() {
  const url = "https://www.livehindustan.com/";
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.goto(url, { waitUntil: "networkidle2", timeout: 90000 });
    
    const html = await page.content();
    const $ = cheerio.load(html);
    const items = [];
    
    // Try multiple selectors for Live Hindustan
    $("article, [class*='news'], h1, h2, h3").each((_, el) => {
      const titleEl = $(el).find("h1, h2, h3, .headline, .title, .story__title, .news-title").first();
      const title = titleEl.text().trim() || $(el).text().trim();
      
      // Try different ways to find the link
      const linkEl = $(el).find("a").first();
      const closestLink = $(el).closest("a").attr("href");
      const linkPart = linkEl.attr("href") || closestLink;
      const link = linkPart ? (linkPart.startsWith("http") ? linkPart : "https://www.livehindustan.com" + linkPart) : null;
      
      const description = $(el).find("p, .summary, .excerpt, .description, .story__desc, .news-desc").first().text().trim();
      
      if (title && link && title.length > 10 && !title.includes('Top Hindi News') && !title.includes('राशि') && !title.includes('मेष') && !title.includes('वृष') && !title.includes('मिथुन')) {
        items.push(normalizeItem({ title, link, description }));
      }
    });
    
    console.log(`✅ Scraped ${items.length} items from Live Hindustan`);
    return items;
    
  } catch (error) {
    console.error('❌ Error scraping Live Hindustan:', error.message);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
