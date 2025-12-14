import puppeteer from 'puppeteer';
import chromium from '@sparticuz/chromium';
import puppeteerCore from 'puppeteer-core';

export const getBrowser = async () => {
    const isProduction = process.env.NODE_ENV === 'production';
    // Render sets the RENDER environment variable to true
    // We also check for PUPPETEER_EXECUTABLE_PATH which we set in Dockerfile
    const isRender = process.env.RENDER || process.env.PUPPETEER_EXECUTABLE_PATH;

    if (isRender) {
        // Render / Docker environment (Uses installed Google Chrome)
        console.log('🚀 Launching Puppeteer in Docker/Render environment...');
        return await puppeteer.launch({
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--single-process'
            ],
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome-stable',
            headless: 'new'
        });
    } else if (isProduction) {
        // Vercel / Serverless environment (Uses @sparticuz/chromium)
        // Kept for backward compatibility if you still use Vercel
        console.log('🚀 Launching Puppeteer in Vercel/Serverless environment...');
        return await puppeteerCore.launch({
            args: [
                ...chromium.args,
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-setuid-sandbox',
                '--no-sandbox'
            ],
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        });
    } else {
        // Local development environment
        console.log('🚀 Launching Puppeteer in Local environment...');
        return await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    }
};
