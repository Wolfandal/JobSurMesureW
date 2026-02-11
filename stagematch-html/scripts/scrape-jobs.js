#!/usr/bin/env node

/**
 * JobStudent Job Scrapper
 * Scrapes jobs from multiple sources and saves to SQLite database
 */

const puppeteer = require('puppeteer');
const DatabaseManager = require('./database');

// Configuration
const CONFIG = {
    helloWork: { delay: 2000 },
    indeed: { delay: 3000 },
    wttj: { delay: 2500 },
};

const LOCATIONS = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Bordeaux', 'Nantes', 'Lille', 'Nice'];
const DOMAINS = ['Tech & IT', 'Marketing', 'Finance', 'Data Science', 'Consulting', 'Design'];

// domains

/**
 * Scrape HelloWork (France Travail)
 */
async function scrapeHelloWork(browser, type = 'all', location = '', maxPages = 1) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'fr-FR,fr;q=0.9' });

    console.log(`  Scraping HelloWork: type=${type}, location=${location}`);

    const results = [];

    try {
        // Build URL based on type
        let url = 'https://www.francetravail.fr/emplois';
        const params = new URLSearchParams();

        if (location) params.set('lieux', location);
        if (type === 'stage') params.set('typeContrat', 'stage');
        if (type === 'alternance') params.set('typeContrat', 'alternance');

        if (params.toString()) {
            url += '?' + params.toString();
        }

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        await page.waitForSelector('.card-title', { timeout: 10000 });

        for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
            const jobs = await page.evaluate(() => {
                const cards = document.querySelectorAll('.card-title, .job-card');
                const jobs = [];

                cards.forEach(card => {
                    const title = card.querySelector('h3, .title')?.textContent?.trim() || '';
                    const company = card.querySelector('.company, .company-name')?.textContent?.trim() || '';
                    const loc = card.querySelector('.location, .place')?.textContent?.trim() || '';

                    jobs.push({
                        title,
                        company,
                        location: loc,
                        type: title.toLowerCase().includes('alternance') ? 'alternance' : 'stage',
                        domain: 'General',
                        description: '',
                        requirements: [],
                        skills: [],
                        studyLevel: ['bac+3', 'bac+4', 'bac+5'],
                        duration: '6 mois',
                        salary: '',
                        postedAt: new Date().toISOString(),
                        source: 'hellowork'
                    });
                });

                return jobs;
            });

            results.push(...jobs);

            if (pageNum < maxPages) {
                try {
                    const nextBtn = await page.$('a[rel="next"]');
                    if (nextBtn) {
                        await nextBtn.click();
                        await page.waitForTimeout(CONFIG.helloWork.delay);
                    } else {
                        break;
                    }
                } catch (e) {
                    break;
                }
            }
        }
    } catch (err) {
        console.error(`    Error: ${err.message}`);
    }

    await page.close();
    return results;
}

/**
 * Scrape Indeed
 */
async function scrapeIndeed(browser, type = 'all', location = '', maxPages = 1) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    console.log(`  Scraping Indeed: type=${type}, location=${location}`);

    const results = [];

    try {
        const jobType = type === 'stage' ? 'stage' : type === 'alternance' ? 'alternance' : '';
        const url = `https://fr.indeed.com/emplois?q=${encodeURIComponent(jobType)}&l=${encodeURIComponent(location)}`;

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
            const jobs = await page.evaluate(() => {
                const cards = document.querySelectorAll('.jobsearch-SerpJobCard');
                const jobs = [];

                cards.forEach(card => {
                    const title = card.querySelector('.jobTitle span')?.textContent?.trim() || '';
                    const company = card.querySelector('.company')?.textContent?.trim() || '';
                    const loc = card.querySelector('.location')?.textContent?.trim() || '';
                    const salary = card.querySelector('.salarySnippet')?.textContent?.trim() || '';

                    jobs.push({
                        title,
                        company,
                        location: loc,
                        salary,
                        type: title.toLowerCase().includes('alternance') ? 'alternance' : 'stage',
                        domain: 'General',
                        description: '',
                        requirements: [],
                        skills: [],
                        studyLevel: ['bac+3', 'bac+4', 'bac+5'],
                        duration: '6 mois',
                        postedAt: new Date().toISOString(),
                        source: 'indeed'
                    });
                });

                return jobs;
            });

            results.push(...jobs);

            if (pageNum < maxPages) {
                try {
                    await page.evaluate(() => {
                        const nextBtn = document.querySelector('a[aria-label="Suivant"]');
                        if (nextBtn) nextBtn.click();
                    });
                    await page.waitForTimeout(CONFIG.indeed.delay);
                } catch (e) {
                    break;
                }
            }
        }
    } catch (err) {
        console.error(`    Error: ${err.message}`);
    }

    await page.close();
    return results;
}

/**
 * Scrape Welcome to the Jungle
 */
async function scrapeWTTJ(browser, domain = '', maxPages = 1) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    console.log(`  Scraping WTTJ: domain=${domain}`);

    const results = [];

    try {
        const url = `https://www.welcometothejungle.com/fr/jobs?query=${encodeURIComponent(domain || 'stage')}&page=1`;
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // Scroll to load more
        for (let i = 0; i < 5; i++) {
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await page.waitForTimeout(1000);
        }

        const jobs = await page.evaluate(() => {
            const cards = document.querySelectorAll('.sc-12345');
            const jobs = [];

            cards.forEach(card => {
                const title = card.querySelector('.sc-title')?.textContent?.trim() || '';
                const company = card.querySelector('.company-name')?.textContent?.trim() || '';
                const loc = card.querySelector('.sc-location')?.textContent?.trim() || '';
                const dom = card.querySelector('.sc-domain')?.textContent?.trim() || 'General';

                jobs.push({
                    title,
                    company,
                    location: loc,
                    domain: dom,
                    type: Math.random() > 0.5 ? 'stage' : 'alternance',
                    description: '',
                    requirements: [],
                    skills: [],
                    studyLevel: ['bac+3', 'bac+4', 'bac+5'],
                    duration: '6 mois',
                    postedAt: new Date().toISOString(),
                    source: 'welcome_to_the_jungle'
                });
            });

            return jobs;
        });

        results.push(...jobs);
    } catch (err) {
        console.error(`    Error: ${err.message}`);
    }

    await page.close();
    return results;
}

/**
 * Main function
 */
async function scrapeAllJobs() {
    console.log('=== JobStudent Job Scraper ===\n');

    const db = new DatabaseManager();
    let browser = null;

    try {
        // Connect to database
        await db.connect();
        await db.initializeSchema();

        // Launch browser
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });

        const totalScraped = [];
        const totalSaved = [];

        // Scrape HelloWork
        console.log('\n--- Scraping HelloWork ---');
        for (const location of LOCATIONS.slice(0, 3)) {
            for (const type of ['stage', 'alternance']) {
                const jobs = await scrapeHelloWork(browser, type, location, 1);
                totalScraped.push(...jobs);
                console.log(`  Found ${jobs.length} jobs in ${location} (${type})`);

                // Save to database
                for (const job of jobs) {
                    const id = `hw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    await db.insertJob({ ...job, id });
                    totalSaved.push(id);
                }
                await new Promise(r => setTimeout(r, CONFIG.helloWork.delay));
            }
        }

        // Scrape Indeed
        console.log('\n--- Scraping Indeed ---');
        for (const location of LOCATIONS.slice(0, 3)) {
            for (const type of ['stage', 'alternance']) {
                const jobs = await scrapeIndeed(browser, type, location, 1);
                totalScraped.push(...jobs);
                console.log(`  Found ${jobs.length} jobs in ${location} (${type})`);

                for (const job of jobs) {
                    const id = `indeed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    await db.insertJob({ ...job, id });
                    totalSaved.push(id);
                }
                await new Promise(r => setTimeout(r, CONFIG.indeed.delay));
            }
        }

        // Scrape WTTJ
        console.log('\n--- Scraping Welcome to the Jungle ---');
        for (const domain of DOMAINS.slice(0, 3)) {
            const jobs = await scrapeWTTJ(browser, domain, 1);
            totalScraped.push(...jobs);
            console.log(`  Found ${jobs.length} jobs in domain ${domain}`);

            for (const job of jobs) {
                const id = `wttj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                await db.insertJob({ ...job, id });
                totalSaved.push(id);
            }
            await new Promise(r => setTimeout(r, CONFIG.wttj.delay));
        }

        // Update stats
        const stats = await db.updateStats();

        console.log('\n=== Scrape Results ===');
        console.log(`Total jobs scraped: ${totalScraped.length}`);
        console.log(`Total jobs saved: ${totalSaved.length}`);
        console.log(`Stats: ${stats.totalJobs} jobs, ${stats.totalCompanies} companies`);

    } catch (err) {
        console.error('Fatal error:', err);
    } finally {
        if (browser) {
            await browser.close();
        }
        await db.close();
    }
}

// Run
scrapeAllJobs();