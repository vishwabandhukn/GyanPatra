import axios from 'axios';
import * as cheerio from 'cheerio';
import { getBrowser } from '../utils/browserClient.js';

// Helper to normalize items
function normalizeItem(item) {
  return {
    title: item.title?.trim() || '',
    link: item.link || '',
    description: item.description?.trim() || '',
    publishedAt: item.publishedAt || new Date().toISOString()
  };
}

// Helper to fetch HTML with Axios
async function fetchHTML(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,kn;q=0.8',
        'Referer': 'https://www.google.com/',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"'
      },
      timeout: 30000 // 30 seconds timeout
    });
    return response.data;
  } catch (error) {
    console.error(`❌ Axios Error fetching URL ${url}:`, error.message);
    return null;
  }
}

// --- Prajavani ---

async function fetchPrajavaniNewsStatic() {
  const url = "https://www.prajavani.net/";
  const html = await fetchHTML(url);
  if (!html) return [];

  const $ = cheerio.load(html);
  const items = [];

  $("div.story-card").each((_, el) => {
    const titleEl = $(el).find("a.headline-link, a").first();
    const title = titleEl.find("h1, h2, h3").text().trim() || titleEl.text().trim();
    const linkPart = titleEl.attr("href");
    const link = linkPart ? (linkPart.startsWith("http") ? linkPart : "https://www.prajavani.net" + linkPart) : null;
    const description = $(el).find("p, .summary, .excerpt").first().text().trim();

    if (title && link) items.push(normalizeItem({ title, link, description }));
  });
  return items;
}

async function fetchPrajavaniNewsPuppeteer() {
  const url = "https://www.prajavani.net/";
  let browser;
  try {
    browser = await getBrowser();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) req.abort();
      else req.continue();
    });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    try {
      await page.waitForSelector("div.story-card", { timeout: 15000 });
    } catch (e) {
      console.log("⚠️ Puppeteer Timeout waiting for Prajavani selector, continuing...");
    }

    const html = await page.content();
    const $ = cheerio.load(html);
    const items = [];
    $("div.story-card").each((_, el) => {
      const titleEl = $(el).find("a.headline-link, a").first();
      const title = titleEl.find("h1, h2, h3").text().trim() || titleEl.text().trim();
      const linkPart = titleEl.attr("href");
      const link = linkPart ? (linkPart.startsWith("http") ? linkPart : "https://www.prajavani.net" + linkPart) : null;
      const description = $(el).find("p, .summary, .excerpt").first().text().trim();
      if (title && link) items.push(normalizeItem({ title, link, description }));
    });
    return items;
  } catch (error) {
    console.error(`❌ Puppeteer Error scraping Prajavani:`, error.message);
    return [];
  } finally {
    if (browser) await browser.close();
  }
}

export async function fetchPrajavaniNews() {
  console.log("🔄 Attempting Prajavani via Static Fetch...");
  let items = await fetchPrajavaniNewsStatic();

  if (items.length === 0) {
    console.log("⚠️ Static fetch failed or empty. Falling back to Puppeteer...");
    items = await fetchPrajavaniNewsPuppeteer();
  }

  console.log(`✅ Final Prajavani Count: ${items.length}`);
  return items;
}

// --- Deccan Herald ---

async function fetchDeccanheraldNewsStatic() {
  const url = "https://www.deccanherald.com/";
  const html = await fetchHTML(url);
  if (!html) return [];

  const $ = cheerio.load(html);
  const items = [];

  $("div.story-card").each((_, el) => {
    const titleEl = $(el).find("a.headline-link, a").first();
    const title = titleEl.find("h1, h2, h3").text().trim() || titleEl.text().trim();
    const linkPart = titleEl.attr("href");
    const link = linkPart ? (linkPart.startsWith("http") ? linkPart : "https://www.deccanherald.com/" + linkPart) : null;
    const description = $(el).find("p, .summary, .excerpt").first().text().trim();

    if (title && link) items.push(normalizeItem({ title, link, description }));
  });
  return items;
}

async function fetchDeccanheraldNewsPuppeteer() {
  const url = "https://www.deccanherald.com/";
  let browser;
  try {
    browser = await getBrowser();
    const page = await browser.newPage();
    await page.setBypassCSP(true);
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    const html = await page.content();
    const $ = cheerio.load(html);
    const items = [];
    $("div.story-card").each((_, el) => {
      const titleEl = $(el).find("a.headline-link, a").first();
      const title = titleEl.find("h1, h2, h3").text().trim() || titleEl.text().trim();
      const linkPart = titleEl.attr("href");
      const link = linkPart ? (linkPart.startsWith("http") ? linkPart : "https://www.deccanherald.com/" + linkPart) : null;
      const description = $(el).find("p, .summary, .excerpt").first().text().trim();
      if (title && link) items.push(normalizeItem({ title, link, description }));
    });
    return items;
  } catch (error) {
    console.error(`❌ Puppeteer Error scraping Deccan Herald:`, error.message);
    return [];
  } finally {
    if (browser) await browser.close();
  }
}

export async function fetchDeccanheraldNews() {
  console.log("🔄 Attempting Deccan Herald via Static Fetch...");
  let items = await fetchDeccanheraldNewsStatic();

  if (items.length === 0) {
    console.log("⚠️ Static fetch failed or empty. Falling back to Puppeteer...");
    items = await fetchDeccanheraldNewsPuppeteer();
  }

  console.log(`✅ Final Deccan Herald Count: ${items.length}`);
  return items;
}

// --- Kannada Prabha ---

async function fetchKannadaPrabhaNewsStatic() {
  const url = "https://www.kannadaprabha.com/";
  const html = await fetchHTML(url);
  if (!html) return [];

  const $ = cheerio.load(html);
  const items = [];

  $("div[class*='story-card'], div[class*='storycard']").each((_, el) => {
    const mainLink = $(el).find("a").not(".arrow-component.arr--section-name").first();
    const title = mainLink.text().trim();
    const linkPart = mainLink.attr("href");
    const link = linkPart ? (linkPart.startsWith("http") ? linkPart : "https://www.kannadaprabha.com" + linkPart) : null;
    const description = $(el).find("p, .summary, .excerpt").first().text().trim();

    if (title && link && !title.includes("ದೇಶ") && !title.includes("ರಾಜ್ಯ") && !title.includes("ವಿಶ್ವ")) {
      items.push(normalizeItem({ title, link, description }));
    }
  });
  return items;
}

async function fetchKannadaPrabhaNewsPuppeteer() {
  const url = "https://www.kannadaprabha.com/";
  let browser;
  try {
    browser = await getBrowser();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) req.abort();
      else req.continue();
    });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    try {
      await page.waitForSelector("div[class*='story-card'], div[class*='storycard']", { timeout: 15000 });
    } catch (e) {
      console.log("⚠️ Puppeteer Timeout waiting for Kannada Prabha selector, continuing...");
    }

    const html = await page.content();
    const $ = cheerio.load(html);
    const items = [];
    $("div[class*='story-card'], div[class*='storycard']").each((_, el) => {
      const mainLink = $(el).find("a").not(".arrow-component.arr--section-name").first();
      const title = mainLink.text().trim();
      const linkPart = mainLink.attr("href");
      const link = linkPart ? (linkPart.startsWith("http") ? linkPart : "https://www.kannadaprabha.com" + linkPart) : null;
      const description = $(el).find("p, .summary, .excerpt").first().text().trim();
      if (title && link && !title.includes("ದೇಶ") && !title.includes("ರಾಜ್ಯ") && !title.includes("ವಿಶ್ವ")) {
        items.push(normalizeItem({ title, link, description }));
      }
    });
    return items;
  } catch (error) {
    console.error(`❌ Puppeteer Error scraping Kannada Prabha:`, error.message);
    return [];
  } finally {
    if (browser) await browser.close();
  }
}

export async function fetchKannadaPrabhaNews() {
  console.log("🔄 Attempting Kannada Prabha via Static Fetch...");
  let items = await fetchKannadaPrabhaNewsStatic();

  if (items.length === 0) {
    console.log("⚠️ Static fetch failed or empty. Falling back to Puppeteer...");
    items = await fetchKannadaPrabhaNewsPuppeteer();
  }

  console.log(`✅ Final Kannada Prabha Count: ${items.length}`);
  return items;
}
