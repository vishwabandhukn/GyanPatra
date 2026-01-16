# GyanPatra Backend Code Guide

This guide walks you through the backend code of the **GyanPatra** project line-by-line. 

## **Architecture Overview**
The backend is a **Node.js** and **Express** application that serves as a news aggregator. It performs two main functions:
1.  **Background Jobs:** Periodically fetches news from various sources (RSS feeds and custom scrapers) and saves them to a **MongoDB** database.
2.  **API:** Exposes endpoints for the frontend to retrieve this stored news.

---

## **1. Entry Point: `server.js`**
This is the heart of the application. It sets up the server, database connection, and scheduled tasks.

### **Code Breakdown**
-   **Imports (Lines 1-13):**
    -   `express`: Web framework.
    -   `mongoose`: MongoDB object modeling.
    -   `cors`: Handling Cross-Origin Resource Sharing.
    -   `dotenv`: Loading environment variables (like DB passwords).
    -   `node-cron`: Scheduling background jobs.
    -   `apiRoutes`: Imports the API endpoints.
    -   `rssService`: Imports the service responsible for fetching news.

-   **Setup (Lines 14-17):**
    -   Initializes the `app`.
    -   Sets the `PORT` (defaults to 8001).
    -   Sets `MONGODB_URI` for connecting to the database.

-   **CORS Configuration (Lines 19-51):**
    -   **Important:** This block manually handles CORS headers. It allows requests specifically from your frontend (`localhost:5173` or your production `CLIENT_URI`).
    -   It supports credentials (cookies/headers) which is crucial for some deployments.

-   **Middleware (Lines 54-61):**
    -   Parses JSON and URL-encoded data.
    -   Logs every incoming request method and path (e.g., `GET /api/news`) for debugging.

-   **Routes (Lines 64-78):**
    -   Mounts all API routes under `/api`.
    -   The root route `/` returns a simple JSON message to verify the server is running.

-   **Error Handling (Lines 81-97):**
    -   Catches errors and sends a user-friendly 500 JSON response.
    -   Handles 404s for unknown routes.

-   **Database Connection (Lines 100-108):**
    -   `connectDB`: An async function that connects to MongoDB using Mongoose.

-   **Background Job (Lines 112-120):**
    -   **Critical Component:** `cron.schedule('*/15 * * * *', ...)`
    -   This tells the server to run `rssService.refreshAllSources()` **every 15 minutes**.
    -   This happens automatically in the background, keeping your news fresh without user intervention.

-   **Start Server (Lines 123-144):**
    -   `startServer`: Connects to DB first, then starts listening on the port.
    -   **Initial Fetch:** It triggers `rssService.refreshAllSources()` immediately on startup (without waiting for the 15-minute timer) so the database isn't empty when you first run the app.

---

## **2. Database Model: `models/NewsItem.js`**
Defines the structure of the news data stored in MongoDB.

### **Code Breakdown**
-   **Schema Definition (Lines 3-47):**
    -   `sourceId` (e.g., 'prajavani'), `language`, `title`, `link`.
    -   `publishedAt`: Date of publication.
    -   `guid`: A generic unique identifier (often the URL) to prevent duplicates.
    -   `createdAt`: Includes `expires: 604800` (7 days). This is a **TTL (Time To Live)** index. MongoDB will automatically delete news older than 7 days to save space.

-   **Indexes (Lines 50-51):**
    -   Optimizes search performance when querying by `sourceId` or `language` sorted by date.

---

## **3. API Routes: `routes/api.js`**
Defines the URLs the frontend can call.

### **Code Breakdown**
-   **Caching (Lines 3-8):**
    -   Uses `node-cache` to store responses in memory for a short time (300 seconds / 5 mins). This reduces load on the database.

-   **Rate Limiting (Lines 11-21):**
    -   Prevents abuse by limiting how many times an IP can call the API (100 requests / 15 mins).

-   **Endpoints:**
    -   **`GET /sources` (Lines 26-56):**
        -   Returns the list of enabled news sources (The Hindu, Prajavani, etc.) grouped by language.
        -   Cached for 1 hour.
    -   **`GET /news` (Lines 59-105):**
        -   **Main Endpoint.**
        -   Accepts `?sourceId=...` or `?language=...` query parameters.
        -   Checks the cache first. If empty, calls `rssService.getCachedNews` to get data from MongoDB.
    -   **`POST /refresh` (Lines 109-150):**
        -   Allows manually forcing a refresh (e.g., a "Refresh" button on the frontend).
        -   Can refresh a specific source or all sources.
        -   Invalidates the cache so new data shows up immediately.
    -   **`GET /health` (Line 153):**
        -   Simple check to see if the API is alive.

---

## **4. Core Logic: `services/rssService.js`**
This service manages fetching data from the outside world and saving it to your database.

### **Code Breakdown**
-   **Dependencies:** Uses `rss-parser` for standard XML feeds and imports custom scrapers for sites that don't have feeds.
-   **Concurrency (Lines 21):** Uses `pLimit(5)` to ensure we don't start more than 5 fetches at once, preventing network issues.

-   **Methods:**
    -   `fetchFeed`: Decides whether to use the standard RSS parser or a custom scraper (`scrapePrajavani`, etc.) based on the source configuration.
    -   `sanitizeContent`: Cleans up HTML tags to ensure safe and clean text.
    -   `normalizeItem`: Converts different data formats (RSS vs Scraper) into a standard object matching your `NewsItem` model.
    -   `saveItems`: Uses **Mongoose `bulkWrite`** with `upsert: true`. This is efficient: it checks if a news item exists (by `guid`); if so, it updates it; if not, it inserts it.
    -   `refreshAllSources`: Loops through every source in `RSS_SOURCES` and calls `fetchFeed` for each.

---

## **5. Scrapers: `services/prajavaniService.js` & `additionalScrapers.js`**
Used for websites that don't provide an RSS feed.

### **How they work (Pattern)**
These files use a "Smart Fallback" strategy:
1.  **Static Fetch (Axios + Cheerio):** Fast and lightweight. It downloads the raw HTML and uses Cheerio (like jQuery for the server) to find elements like `h1`, `.story-card`, etc.
2.  **Puppeteer Fallback:** If the site uses heavy JavaScript (React/Next.js dynamic loading) and static fetch returns nothing, it launches a real headless browser (Puppeteer) to load the page and extract data.

### **Files**
-   **`prajavaniService.js`**:
    -   Specifically tuned selectors for *Prajavani.net*.
    -   Functions: `fetchPrajavaniNewsStatic` and `fetchPrajavaniNewsPuppeteer`.
    -   Exports `fetchPrajavaniNews` which tries static first, then Puppeteer.
-   **`additionalScrapers.js`**:
    -   Contains similar logic for **Deccan Herald**, **News18 Hindi**, and **Live Hindustan**.
    -   Includes specific CSS selectors for each site (e.g., `div.story-card`, `.headline`).

---

## **6. Browser Automation: `utils/browserClient.js`**
A helper to launch Puppeteer correctly in different environments.

### **Code Breakdown**
-   **Environment Detection:** 
    -   **Docker/Render:** Detects if running on Render (cloud). Launches `google-chrome-stable` (installed via Dockerfile) with specific flags (`--no-sandbox`).
    -   **Local:** Launches standard Puppeteer for development.
-   **Why is this needed?** Cloud servers often crash if you try to run Chrome without specific memory flags (`--disable-dev-shm-usage`). This file handles that complexity.

---

## **7. Configuration: `constants/sources.js`**
The "Config file" that defines what to scrape.

### **Code Breakdown**
-   **`RSS_SOURCES` Object:**
    -   Groups sources by language (`english`, `kannada`, `hindi`).
    -   Each source has:
        -   `id`: Unique ID.
        -   `feedUrl`: The RSS URL (or `null` if it's a scraper).
        -   `type`: `'rss'` or `'scraper'`.
-   **`LANGUAGES` Array:**
    -   Defines the available language tabs for the frontend.

---

## **8. Deployment: `Dockerfile`**
Instructions to build the backend for production (Render).

### **Code Breakdown**
-   Base Image: `ghcr.io/puppeteer/puppeteer:21.5.0`. This is a special image that comes with Chrome pre-installed, saving you from complex setup.
-   `ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true`: Tells `npm` not to download Chrome again since it's in the image.
-   `npm install`: Installs your dependencies.
-   `CMD [ "node", "server.js" ]`: Starts your app.
