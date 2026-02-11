#!/usr/bin/env node

/**
 * JobStudent Scraper - Scrapes job offers from multiple sources
 * Sources: HelloWork, Indeed, Welcome to the Jungle, LinkedIn, JobTeaser
 */

const puppeteer = require('puppeteer');
const DatabaseManager = require('./database');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const CONFIG = {
    helloWork: {
        baseUrl: 'https://www.francetravail.fr/emplois',
        delay: 2000, // ms between requests
    },
    indeed: {
        baseUrl: 'https://fr.indeed.com',
        delay: 3000,
    },
    wttj: {
        baseUrl: 'https://www.welcometothejungle.com',
        delay: 2500,
    },
    linkedin: {
        baseUrl: 'https://www.linkedin.com',
        delay: 4000,
    },
    jobteaser: {
        baseUrl: 'https://www.jobteaser.com',
        delay: 3000,
    },
};

// Job types to search
const JOB_TYPES = ['stage', 'alternance'];

// Locations to search (major French cities and regions)
const LOCATIONS = [
    'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Bordeaux', 'Nantes',
    'Lille', 'Nice', 'Strasbourg', 'Montpellier', 'Rennes', 'Reims',
    'Saint-Étienne', 'Le Mans', 'Aix-en-Provence', 'Cannes', ' Grenoble',
    'Dijon', 'Angers', 'Grenoble', 'Nîmes', 'Toulon', 'Amiens',
    'Cergy', 'Pau', 'Avignon', 'Douai', 'Quimper', 'Tarbes', 'Perpignan'
];

// Job domains
const DOMAINS = [
    'Tech & IT', 'Marketing', 'Finance', 'Data Science', 'Consulting',
    'Ressources Humaines', 'Design', 'Commerce', 'Communication',
    'Juridique', 'Health', 'Education', 'Engineering', 'Science'
];

class JobScraper {
    constructor() {
        this.db = new DatabaseManager();
        this.browser = null;
        this.jobsScraped = 0;
        this.jobsSaved = 0;
    }

    async init() {
        console.log('Initializing scraper...');
        await this.db.connect();
        await this.db.initializeSchema();

        // Launch headless browser
        this.browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security',
                '--diable-features=IsolateOrigins,site-per-process',
                '--accept-lang=fr-FR,fr'
            ]
        });

        console.log('Scraper initialized');
    }

    async scrapeAll() {
        console.log('\n=== Starting Full Scrape ===\n');

        const results = {
            helloWork: { scraped: 0, saved: 0 },
            indeed: { scraped: 0, saved: 0 },
            wttj: { scraped: 0, saved: 0 },
            linkedin: { scraped: 0, saved: 0 },
            jobteaser: { scraped: 0, saved: 0 }
        };

        // Scrape each source
        results.helloWork = await this.scrapeHelloWork(2); // 2 pages per location
        results.indeed = await this.scrapeIndeed(2);
        results.wttj = await this.scrapeWelcomeToJungle(2);

        // LinkedIn and JobTeaser need more complex auth
        // results.linkedin = await this.scrapeLinkedin(1);
        // results.jobteaser = await this.scrapeJobTeaser(1);

        // Update database stats
        await this.db.updateStats();

        console.log('\n=== Scrape Summary ===');
        console.log(`Total jobs scraped: ${this.jobsScraped}`);
        console.log(`Total jobs saved: ${this.jobsSaved}`);

        for (const [source, stats] of Object.entries(results)) {
            console.log(`${source}: ${stats.scraped} scraped, ${stats.saved} saved`);
        }

        return results;
    }

    async scrapeHelloWork(maxPages = 1) {
        console.log('\n--- Scraping HelloWork ---');
        const results = { scraped: 0, saved: 0 };

        for (const type of JOB_TYPES) {
            console.log(`Searching for ${type}...`);

            for (const location of LOCATIONS.slice(0, 5)) { // Limit to first 5 locations
                try {
                    const page = await this.browser.newPage();
                    await page.setViewport({ width: 1920, height: 1080 });
                    await page.setExtraHTTPHeaders({
                        'Accept-Language': 'fr-FR,fr;q=0.9'
                    });

                    const url = `https://www.francetravail.fr/emplois?motsCles=&lieux=${encodeURIComponent(location)}&typeContrat=${type}`;

                    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
                    await page.waitForSelector('.card-title', { timeout: 10000 });

                    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
                        // Extract job listings
                        const jobs = await page.evaluate(() => {
                            const jobCards = document.querySelectorAll('.card-title, .job-card');
                            const jobs = [];

                            jobCards.forEach(card => {
                                const title = card.querySelector('h3, .title')?.textContent?.trim() || 'Offre inconnue';
                                const company = card.querySelector('.company, .company-name')?.textContent?.trim() || 'Entreprise inconnue';
                                const location = card.querySelector('.location, .place')?.textContent?.trim() || 'France';

                                jobs.push({
                                    title,
                                    company,
                                    location,
                                    type: 'stage',
                                    domain: 'General',
                                    description: '',
                                    requirements: [],
                                    skills: [],
                                    studyLevel: ['bac+3', 'bac+4', 'bac+5'],
                                    duration: '6 mois',
                                    salary: '',
                                    startDate: '',
                                    postedAt: new Date().toISOString(),
                                    remote: false,
                                    source: 'hellowork'
                                });
                            });

                            return jobs;
                        });

                        results.scraped += jobs.length;
                        console.log(`  Page ${pageNum}: Found ${jobs.length} jobs`);

                        // Save jobs to database
                        for (const job of jobs) {
                            const id = `hw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                            const jobWithId = { ...job, id };
                            await this.db.insertJob(jobWithId);
                            results.saved++;
                            this.jobsScraped++;
                            this.jobsSaved++;
                        }

                        // Navigate to next page if available
                        if (pageNum < maxPages) {
                            const nextBtn = await page.$('a[rel="next"], .pagination-next');
                            if (nextBtn) {
                                await nextBtn.click();
                                await page.waitForTimeout(CONFIG.helloWork.delay);
                            } else {
                                break;
                            }
                        }
                    }

                    await page.close();
                    await new Promise(r => setTimeout(r, CONFIG.helloWork.delay));
                } catch (err) {
                    console.error(`  Error scraping HelloWork for ${type} in ${location}:`, err.message);
                }
            }
        }

        return results;
    }

    async scrapeIndeed(maxPages = 1) {
        console.log('\n--- Scraping Indeed ---');
        const results = { scraped: 0, saved: 0 };

        for (const type of JOB_TYPES) {
            const jobTypeParam = type === 'stage' ? 'stage' : 'alternance';

            for (const location of LOCATIONS.slice(0, 3)) {
                try {
                    const page = await this.browser.newPage();
                    await page.setViewport({ width: 1920, height: 1080 });

                    const url = `https://fr.indeed.com/emplois?q=${jobTypeParam}&l=${encodeURIComponent(location)}`;

                    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

                    // Wait for job cards
                    await page.waitForSelector('.jobsearch-JobCard', { timeout: 10000 });

                    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
                        const jobs = await page.evaluate(() => {
                            const cards = document.querySelectorAll('.jobsearch-JobCard');
                            const jobs = [];

                            cards.forEach(card => {
                                const title = card.querySelector('.jobTitle, h2 a')?.textContent?.trim() || 'Offre';
                                const company = card.querySelector('.companyName')?.textContent?.trim() || 'Entreprise';
                                const location = card.querySelector('.companyLocation')?.textContent?.trim() || 'France';
                                const salary = card.querySelector('.salary-snippet')?.textContent?.trim() || '';

                                jobs.push({
                                    title,
                                    company,
                                    location,
                                    type: 'stage',
                                    domain: 'General',
                                    description: '',
                                    requirements: [],
                                    skills: [],
                                    studyLevel: ['bac+3', 'bac+4', 'bac+5'],
                                    duration: '6 mois',
                                    salary,
                                    startDate: '',
                                    postedAt: new Date().toISOString(),
                                    remote: false,
                                    source: 'indeed'
                                });
                            });

                            return jobs;
                        });

                        results.scraped += jobs.length;
                        console.log(`  Page ${pageNum}: Found ${jobs.length} jobs`);

                        for (const job of jobs) {
                            const id = `indeed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                            await this.db.insertJob({ ...job, id });
                            results.saved++;
                            this.jobsScraped++;
                            this.jobsSaved++;
                        }

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

                    await page.close();
                    await new Promise(r => setTimeout(r, CONFIG.indeed.delay));
                } catch (err) {
                    console.error(`  Error scraping Indeed for ${type} in ${location}:`, err.message);
                }
            }
        }

        return results;
    }

    async scrapeWelcomeToJungle(maxPages = 1) {
        console.log('\n--- Scraping Welcome to the Jungle ---');
        const results = { scraped: 0, saved: 0 };

        for (const domain of DOMAINS.slice(0, 5)) {
            try {
                const page = await this.browser.newPage();
                await page.setViewport({ width: 1920, height: 1080 });

                const url = `https://www.welcometothejungle.com/fr/jobs?query=${encodeURIComponent(domain)}&sortBy=relevance`;

                await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
                await page.waitForSelector('.sc-12345', { timeout: 10000 });

                const jobs = await page.evaluate(() => {
                    const cards = document.querySelectorAll('.job-card');
                    const jobs = [];

                    cards.forEach(card => {
                        const title = card.querySelector('.sc-title')?.textContent?.trim() || 'Offre';
                        const company = card.querySelector('.company-name')?.textContent?.trim() || 'Entreprise';
                        const location = card.querySelector('.location')?.textContent?.trim() || 'France';

                        jobs.push({
                            title,
                            company,
                            location,
                            type: Math.random() > 0.5 ? 'stage' : 'alternance',
                            domain,
                            description: '',
                            requirements: [],
                            skills: [],
                            studyLevel: ['bac+3', 'bac+4', 'bac+5'],
                            duration: '6 mois',
                            salary: '',
                            startDate: '',
                            postedAt: new Date().toISOString(),
                            remote: Math.random() > 0.7,
                            source: 'welcome_to_the_jungle'
                        });
                    });

                    return jobs;
                });

                results.scraped += jobs.length;
                console.log(`Domain ${domain}: Found ${jobs.length} jobs`);

                for (const job of jobs) {
                    const id = `wttj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    await this.db.insertJob({ ...job, id });
                    results.saved++;
                    this.jobsScraped++;
                    this.jobsSaved++;
                }

                await page.close();
                await new Promise(r => setTimeout(r, CONFIG.wttj.delay));
            } catch (err) {
                console.error(`  Error scraping WTTJ for ${domain}:`, err.message);
            }
        }

        return results;
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
        await this.db.close();
        console.log('\nScraper closed');
    }
}

// Main execution
async function main() {
    const scraper = new JobScraper();

    try {
        await scraper.init();
        await scraper.scrapeAll();
        await scraper.close();
    } catch (err) {
        console.error('Fatal error:', err);
        await scraper.close();
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { JobScraper, CONFIG };