#!/usr/bin/env node

/**
 * Test Google Jobs for scraping
 */

const { chromium } = require('playwright');

async function testGoogleJobs() {
    const browser = await chromium.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        viewport: { width: 1920, height: 1080 }
    });

    try {
        // Test with Google Jobs search
        const url = 'https://www.google.com/search?q=stage+paris&tbm=jobs';
        console.log('Navigating to:', url);

        await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
        await page.waitForTimeout(3000);

        // Save HTML to file
        const fs = require('fs');
        const content = await page.content();
        fs.writeFileSync('c:/tmp/google_jobs_snapshot.html', content);
        console.log('HTML snapshot saved to c:/tmp/google_jobs_snapshot.html');

        // Test different selectors
        const testSelectors = [
            'div[data-jk]',
            '.jobsearch-JobCard',
            'a[data-href]',
            'div[data-view-type]',
            '[data-company-id]',
            '.jobsearch-SerpJobCard'
        ];

        console.log('\n=== Testing Selectors ===');
        for (const selector of testSelectors) {
            const count = await page.$$(selector);
            console.log(`${selector}: ${count.length} elements`);
        }

        // Get all job-like elements
        const jobs = await page.evaluate(() => {
            const jobs = [];
            const cards = document.querySelectorAll('div[data-jk], .jobsearch-JobCard, a[data-href], .job-card');

            console.log(`\nFound ${cards.length} cards`);

            cards.forEach((card, idx) => {
                const titleEl = card.querySelector('h1, h2, h3, h4, [class*="title"], [role="heading"]');
                const title = titleEl?.textContent?.trim().substring(0, 50) || 'NO TITLE';

                if (title.length > 10 && title.length < 200) {
                    const companyEl = card.querySelector('.company, .companyName, [class*="company"]');
                    const company = companyEl?.textContent?.trim() || 'NO COMPANY';

                    const locEl = card.querySelector('.location, .address, [class*="location"]');
                    const location = locEl?.textContent?.trim() || 'NO LOCATION';

                    if (jobs.length < 15) {
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

testGoogleJobs();
