import puppeteer from "puppeteer";
import * as cheerio from "cheerio";

/**
 * Normalize items
 */
function normalizeItem({ title, link, description }) {
  return { title, link, description, pubDate: new Date().toISOString() };
}

/**
 * Scrapes Prajavani
 */
export async function fetchPrajavaniNews() {
  const url = "https://www.prajavani.net/";
  let browser;
  
  try {
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Set user agent to avoid blocking
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    await page.goto(url, { waitUntil: "networkidle2", timeout: 90000 });

    const html = await page.content();
    const $ = cheerio.load(html);
    const items = [];

    // Updated selectors based on current website structure
    $("div.story-card").each((_, el) => {
      const titleEl = $(el).find("a.headline-link, a").first();
      const title = titleEl.find("h1, h2, h3").text().trim() || titleEl.text().trim();
      const linkPart = titleEl.attr("href");
      const link = linkPart ? (linkPart.startsWith("http") ? linkPart : "https://www.prajavani.net" + linkPart) : null;
      const description = $(el).find("p, .summary, .excerpt").first().text().trim();

      if (title && link) items.push(normalizeItem({ title, link, description }));
    });

    console.log(`✅ Scraped ${items.length} items from Prajavani`);
    return items;
    
  } catch (error) {
    console.error('❌ Error scraping Prajavani:', error.message);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/*deccan herald


  
 */

export async function fetchDeccanheraldNews() {
  const url = "https://www.deccanherald.com/";
  let browser;
  
  try {
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Set user agent to avoid blocking
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    await page.goto(url, { waitUntil: "networkidle2", timeout: 90000 });

    const html = await page.content();
    const $ = cheerio.load(html);
    const items = [];

    // Updated selectors based on current website structure
    $("div.story-card").each((_, el) => {
      const titleEl = $(el).find("a.headline-link, a").first();
      const title = titleEl.find("h1, h2, h3").text().trim() || titleEl.text().trim();
      const linkPart = titleEl.attr("href");
      const link = linkPart ? (linkPart.startsWith("http") ? linkPart : "https://www.deccanherald.com/" + linkPart) : null;
      const description = $(el).find("p, .summary, .excerpt").first().text().trim();

      if (title && link) items.push(normalizeItem({ title, link, description }));
    });

    console.log(`✅ Scraped ${items.length} items from deccan herald`);
    return items;
    
  } catch (error) {
    console.error('❌ Error scraping deccan herald:', error.message);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}





export async function fetchKannadaPrabhaNews() {
  const url = "https://www.kannadaprabha.com/";
  let browser;
  
  try {
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Set user agent to avoid blocking
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    const html = await page.content();
    const $ = cheerio.load(html);
    const items = [];

    // Updated selectors based on current website structure
    $("div[class*='story-card'], div[class*='storycard']").each((_, el) => {
      // Get the main article link (not the section link)
      const mainLink = $(el).find("a").not(".arrow-component.arr--section-name").first();
      const title = mainLink.text().trim();
      const linkPart = mainLink.attr("href");
      const link = linkPart ? (linkPart.startsWith("http") ? linkPart : "https://www.kannadaprabha.com" + linkPart) : null;
      
      // Get description from paragraph or summary
      const description = $(el).find("p, .summary, .excerpt").first().text().trim();

      if (title && link && !title.includes("ದೇಶ") && !title.includes("ರಾಜ್ಯ") && !title.includes("ವಿಶ್ವ")) {
        items.push(normalizeItem({ title, link, description }));
      }
    });

    console.log(`✅ Scraped ${items.length} items from Kannada Prabha`);
    return items;
    
  } catch (error) {
    console.error('❌ Error scraping Kannada Prabha:', error.message);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
