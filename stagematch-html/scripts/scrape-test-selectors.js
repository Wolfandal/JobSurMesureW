#!/usr/bin/env node

/**
 * Test script to check actual page structure and find working selectors
 */

const { chromium } = require('playwright');

async function testSelectors() {
    const browser = await chromium.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        viewport: { width: 1920, height: 1080 }
    });

    try {
        // Test with a simple LinkedIn search
        const url = 'https://www.linkedin.com/jobs/search?keywords=stage&location=France&sortBy=DD';
        console.log('Navigating to:', url);

        await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
        await page.waitForTimeout(3000);

        // Accept cookies if present
        try {
            await page.click('button:has-text("Accepter")', { timeout: 3000 });
            await page.waitForTimeout(1000);
        } catch (e) {}

        // Scroll to load more jobs
        for (let i = 0; i < 10; i++) {
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await page.waitForTimeout(400);
        }

        // Get page HTML for debugging
        const content = await page.content();
        console.log('\n=== Page loaded, saving snapshot ===');

        // Save HTML to file
        const fs = require('fs');
        fs.writeFileSync('c:/tmp/page_snapshot.html', content);
        console.log('HTML snapshot saved to c:/tmp/page_snapshot.html');

        // Test different selectors
        const testSelectors = [
            '.base-search-card',
            '.job-search-card',
            'li',
            '.job-card',
            'article',
            '[data-job-id]',
            '.result'
        ];

        console.log('\n=== Testing Selectors ===');
        for (const selector of testSelectors) {
            const count = await page.$$(selector);
            console.log(`${selector}: ${count.length} elements`);
        }

        // Get all job-like elements with detailed info
        const jobs = await page.evaluate(() => {
            const jobs = [];
            const cards = document.querySelectorAll('li, .result, .job-card, .base-search-card');

            console.log(`\nFound ${cards.length} cards`);

            cards.forEach((card, idx) => {
                const rect = card.getBoundingClientRect();
                const titleEl = card.querySelector('h1, h2, h3, h4, [class*="title"]');
                const title = titleEl?.textContent?.trim().substring(0, 50) || 'NO TITLE';

                if (title.length > 10 && title.length < 150) {
                    const companyEl = card.querySelector('.company, .companyName, [class*="company"]');
                    const company = companyEl?.textContent?.trim() || 'NO COMPANY';

                    const locEl = card.querySelector('.location, .address, [class*="location"]');
                    const location = locEl?.textContent?.trim() || 'NO LOCATION';

                    if (jobs.length < 20) {
                        console.log(`Card ${idx}: "${title}" - ${company} in ${location}`);
                        jobs.push({ title, company, location });
                    }
                }
            });

            return jobs;
        });

        console.log('\n=== Final Results ===');
        console.log(`Total jobs found: ${jobs.length}`);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await browser.close();
    }
}

testSelectors();
