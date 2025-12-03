import axios from 'axios';
import * as cheerio from 'cheerio';

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
      },
      timeout: 30000 // 30 seconds timeout
    });
    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching URL ${url}:`, error.message);
    throw error;
  }
}

export async function fetchPrajavaniNews() {
  const url = "https://www.prajavani.net/";

  try {
    const html = await fetchHTML(url);
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

    console.log(`✅ Scraped ${items.length} items from Prajavani (Static)`);
    return items;

  } catch (error) {
    console.error('❌ Error scraping Prajavani:', error.message);
    return [];
  }
}

export async function fetchDeccanheraldNews() {
  const url = "https://www.deccanherald.com/";

  try {
    const html = await fetchHTML(url);
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

    console.log(`✅ Scraped ${items.length} items from Deccan Herald (Static)`);
    return items;

  } catch (error) {
    console.error('❌ Error scraping Deccan Herald:', error.message);
    return [];
  }
}

export async function fetchKannadaPrabhaNews() {
  const url = "https://www.kannadaprabha.com/";

  try {
    const html = await fetchHTML(url);
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

    console.log(`✅ Scraped ${items.length} items from Kannada Prabha (Static)`);
    return items;

  } catch (error) {
    console.error('❌ Error scraping Kannada Prabha:', error.message);
    return [];
  }
}
