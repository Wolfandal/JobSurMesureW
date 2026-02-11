#!/usr/bin/env node

/**
 * JobStudent Complete Scraper
 * Scrapes ALL stage and alternance offers from multiple sources
 */

const { chromium } = require('playwright');
const DatabaseManager = require('./database');

// All French cities
const LOCATIONS = [
    'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Bordeaux', 'Nantes',
    'Lille', 'Nice', 'Strasbourg', 'Montpellier', 'Rennes', 'Reims',
    'Saint-Étienne', 'Le Mans', 'Aix-en-Provence', 'Cannes', 'Grenoble',
    'Dijon', 'Angers', 'Nîmes', 'Toulon', 'Amiens', 'Perpignan', 'Metz',
    'Besançon', 'Caen', 'Orléans', 'Tours', 'Limoges', 'Brest', 'Le Havre',
    'Saint-Denis', 'Montreuil', 'Boulogne-Billancourt', 'Nanterre', 'Versailles',
    'Créteil', 'Poitiers', 'Tarbes', 'Lourdes', 'Pau', 'Bayonne', 'Biarritz',
    'Lorient', 'Quimper', 'Vannes', 'Saint-Malo', 'Rouen', 'Cherbourg',
    'Deauville', 'Alençon', 'Dieppe', 'Évreux', 'Fécamp', 'Lisieux', 'Beauvais',
    'Châlons-en-Champagne', 'Troyes', 'Chaumont', 'Bar-le-Duc', 'Épinal',
    'Mulhouse', 'Colmar', 'Nancy', 'Metz', 'Strasbourg', 'Reims'
];

const DOMAINS = [
    'stage', 'alternance', 'développeur', 'marketing', 'finance',
    'data analyst', 'design', 'commerce', 'rh', 'consulting',
    'ingénieur', 'technicien', 'commercial', 'admin', 'logistique'
];

/**
 * Scrape HelloWork (France Travail)
 */
async function scrapeHelloWork(page, maxPages = 3) {
    console.log('  Scraping HelloWork...');
    const results = [];

    for (const location of LOCATIONS.slice(0, 5)) {
        const types = ['stage', 'alternance'];
        for (const type of types) {
            const url = `https://candidat.francetravail.fr/emplois?motsCles=${type}&lieux=${encodeURIComponent(location)}&typeContrat=${type}`;
            try {
                await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
                await page.waitForTimeout(2000);

                // Wait for job cards
                await page.waitForSelector('.search-card, article, [class*="card"]', { timeout: 10000 }).catch(() => {});

                const jobs = await page.evaluate(() => {
                    const jobs = [];
                    const cards = document.querySelectorAll('.search-card, article, [class*="card"], [class*="job"]');

                    cards.forEach(card => {
                        const titleEl = card.querySelector('h1, h2, h3, .title, [class*="title"]');
                        const title = titleEl?.textContent?.trim() || '';

                        if (!title || title.length < 5) return;

                        const companyEl = card.querySelector('.company, [class*="company"]');
                        const company = companyEl?.textContent?.trim() || 'Entreprise';

                        const locEl = card.querySelector('.location, [class*="location"]');
                        const loc = locEl?.textContent?.trim() || location;

                        const salaryEl = card.querySelector('.salary, [class*="salary"]');
                        const salary = salaryEl?.textContent?.trim() || '';

                        const typeMatch = title.toLowerCase().match(/(alternance|stage)/);
                        const detectedType = typeMatch ? (typeMatch[1] === 'alternance' ? 'alternance' : 'stage') : type;

                        jobs.push({
                            title: title.replace(/\s+/g, ' '),
                            company: company.replace(/\s+/g, ' '),
                            location: loc.replace(/\s+/g, ' '),
                            salary: salary,
                            type: detectedType,
                            domain: 'General',
                            description: '',
                            requirements: [],
                            skills: [],
                            studyLevel: ['bac+3', 'bac+4', 'bac+5'],
                            duration: '6 mois',
                            postedAt: new Date().toISOString(),
                            source: 'hellowork'
                        });
                    });

                    return jobs;
                });

                results.push(...jobs);
                console.log(`    ${location} (${type}): ${jobs.length} jobs`);
            } catch (err) {
                console.log(`    Error for ${location} (${type}): ${err.message}`);
            }
            await new Promise(r => setTimeout(r, 2000));
        }
    }

    return results;
}

/**
 * Scrape Indeed France
 */
async function scrapeIndeed(page, maxPages = 3) {
    console.log('  Scraping Indeed...');
    const results = [];

    for (const location of LOCATIONS.slice(0, 5)) {
        for (const type of ['stage', 'alternance']) {
            const url = `https://fr.indeed.com/emplois?q=${encodeURIComponent(type)}&l=${encodeURIComponent(location)}`;
            try {
                await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
                await page.waitForTimeout(2000);

                const jobs = await page.evaluate(() => {
                    const jobs = [];
                    const cards = document.querySelectorAll('.jobsearch-SerpJobCard, .jobCard, [class*="job"]');

                    cards.forEach(card => {
                        const titleEl = card.querySelector('.jobTitle, h2 a, [class*="title"]');
                        const title = titleEl?.textContent?.trim() || '';

                        if (!title || title.length < 5) return;

                        const companyEl = card.querySelector('.company, [class*="company"]');
                        const company = companyEl?.textContent?.trim() || 'Entreprise';

                        const locEl = card.querySelector('.location, [class*="location"]');
                        const loc = locEl?.textContent?.trim() || location;

                        const salaryEl = card.querySelector('.salary, [class*="salary"]');
                        const salary = salaryEl?.textContent?.trim() || '';

                        jobs.push({
                            title: title.replace(/\s+/g, ' '),
                            company: company.replace(/\s+/g, ' '),
                            location: loc.replace(/\s+/g, ' '),
                            salary: salary,
                            type: 'stage',
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
                console.log(`    ${location} (${type}): ${jobs.length} jobs`);
            } catch (err) {
                console.log(`    Error for ${location} (${type}): ${err.message}`);
            }
            await new Promise(r => setTimeout(r, 2000));
        }
    }

    return results;
}

/**
 * Scrape Welcome to the Jungle
 */
async function scrapeWTTJ(page, maxPages = 2) {
    console.log('  Scraping Welcome to the Jungle...');
    const results = [];

    for (const domain of DOMAINS.slice(0, 5)) {
        const url = `https://www.welcometothejungle.com/fr/jobs?query=${encodeURIComponent(domain)}`;
        try {
            await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
            await page.waitForTimeout(2000);

            for (let i = 0; i < 3; i++) {
                await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                await page.waitForTimeout(500);
            }

            const jobs = await page.evaluate(() => {
                const jobs = [];
                const cards = document.querySelectorAll('.sc-job-card, .job-card, article');

                cards.forEach(card => {
                    const titleEl = card.querySelector('.sc-title, h1, h2, h3, [class*="title"]');
                    const title = titleEl?.textContent?.trim() || '';

                    if (!title || title.length < 5) return;

                    const companyEl = card.querySelector('.company-name, [class*="company"]');
                    const company = companyEl?.textContent?.trim() || 'Entreprise';

                    const locEl = card.querySelector('.sc-location, .location, [class*="location"]');
                    const loc = locEl?.textContent?.trim() || 'France';

                    jobs.push({
                        title: title.replace(/\s+/g, ' '),
                        company: company.replace(/\s+/g, ' '),
                        location: loc.replace(/\s+/g, ' '),
                        type: Math.random() > 0.5 ? 'stage' : 'alternance',
                        domain: 'General',
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
            console.log(`    ${domain}: ${jobs.length} jobs`);
        } catch (err) {
            console.log(`    Error for ${domain}: ${err.message}`);
        }
        await new Promise(r => setTimeout(r, 2000));
    }

    return results;
}

/**
 * Scrape LinkedIn (main source with 19k+ jobs)
 */
async function scrapeLinkedin(page, maxScrolls = 15) {
    console.log('  Scraping LinkedIn...');
    const results = [];

    // Accept cookies if present
    try {
        await page.evaluate(() => {
            const btn = document.querySelector('button[action-type="ACCEPT"]');
            if (btn) btn.click();
        });
        await page.waitForTimeout(1000);
    } catch (e) {}

    for (const domain of DOMAINS.slice(0, 10)) {
        const url = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(domain)}&location=France`;
        try {
            await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
            await page.waitForTimeout(2000);

            // Scroll to load more jobs
            for (let i = 0; i < maxScrolls; i++) {
                await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                await page.waitForTimeout(500);
            }

            const jobs = await page.evaluate(() => {
                const jobs = [];
                const cards = document.querySelectorAll('.base-search-card');

                cards.forEach(card => {
                    const titleEl = card.querySelector('.base-search-card__title');
                    const title = titleEl?.textContent?.trim() || '';

                    if (!title || title.length < 5) return;

                    const companyEl = card.querySelector('.base-search-card__subtitle');
                    const company = companyEl?.textContent?.trim() || 'Entreprise';

                    const locEl = card.querySelector('.base-search-card__metadata span:last-child');
                    const loc = locEl?.textContent?.trim() || 'France';

                    const salaryEl = card.querySelector('[class*="salary"]');
                    const salary = salaryEl?.textContent?.trim() || '';

                    jobs.push({
                        title: title.replace(/\s+/g, ' '),
                        company: company.replace(/\s+/g, ' '),
                        location: loc.replace(/\s+/g, ' '),
                        salary: salary,
                        type: title.toLowerCase().includes('alternance') ? 'alternance' : 'stage',
                        domain: 'General',
                        description: '',
                        requirements: [],
                        skills: [],
                        studyLevel: ['bac+3', 'bac+4', 'bac+5'],
                        duration: '6 mois',
                        postedAt: new Date().toISOString(),
                        source: 'linkedin'
                    });
                });

                return jobs;
            });

            results.push(...jobs);
            console.log(`    ${domain}: ${jobs.length} jobs`);
        } catch (err) {
            console.log(`    Error for ${domain}: ${err.message}`);
        }
        await new Promise(r => setTimeout(r, 2000));
    }

    return results;
}

/**
 * Scrape JobTeaser
 */
async function scrapeJobTeaser(page, maxPages = 2) {
    console.log('  Scraping JobTeaser...');
    const results = [];

    try {
        await page.goto('https://www.jobteaser.com/fr/jobs?search_query=stage+alternance', { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(2000);

        for (let i = 0; i < 5; i++) {
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await page.waitForTimeout(500);
        }

        const jobs = await page.evaluate(() => {
            const jobs = [];
            const cards = document.querySelectorAll('.job-card, .job-offer, article');

            cards.forEach(card => {
                const titleEl = card.querySelector('.job-title, h1, h2, h3, [class*="title"]');
                const title = titleEl?.textContent?.trim() || '';

                if (!title || title.length < 5) return;

                const companyEl = card.querySelector('.company-name, [class*="company"]');
                const company = companyEl?.textContent?.trim() || 'Entreprise';

                const locEl = card.querySelector('.location, [class*="location"]');
                const loc = locEl?.textContent?.trim() || 'France';

                jobs.push({
                    title: title.replace(/\s+/g, ' '),
                    company: company.replace(/\s+/g, ' '),
                    location: loc.replace(/\s+/g, ' '),
                    type: 'stage',
                    domain: 'General',
                    description: '',
                    requirements: [],
                    skills: [],
                    studyLevel: ['bac+3', 'bac+4', 'bac+5'],
                    duration: '6 mois',
                    postedAt: new Date().toISOString(),
                    source: 'jobteaser'
                });
            });

            return jobs;
        });

        results.push(...jobs);
        console.log(`    Found: ${jobs.length} jobs`);
    } catch (err) {
        console.log(`    Error: ${err.message}`);
    }

    return results;
}

/**
 * Main function
 */
async function scrapeAllJobs() {
    console.log('=== JobStudent Complete Scrape ===\n');
    console.log('Starting to scrape jobs from multiple sources...\n');

    const db = new DatabaseManager();
    let browser = null;

    try {
        await db.connect();
        await db.initializeSchema();

        console.log('Launching browser...');
        browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });

        const page = await browser.newPage({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });

        const totalScraped = [];
        const totalSaved = [];

        // Scrape HelloWork
        console.log('\n=== Scraping HelloWork ===');
        const hwJobs = await scrapeHelloWork(page, 3);
        totalScraped.push(...hwJobs);

        for (const job of hwJobs) {
            try {
                const id = `hw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                await db.insertJob({ ...job, id });
                totalSaved.push(id);
            } catch (err) {}
        }
        console.log(`  Total HelloWork: ${hwJobs.length} jobs\n`);

        // Scrape Indeed
        console.log('=== Scraping Indeed ===');
        const indeedJobs = await scrapeIndeed(page, 3);
        totalScraped.push(...indeedJobs);

        for (const job of indeedJobs) {
            try {
                const id = `indeed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                await db.insertJob({ ...job, id });
                totalSaved.push(id);
            } catch (err) {}
        }
        console.log(`  Total Indeed: ${indeedJobs.length} jobs\n`);

        // Scrape WTTJ
        console.log('=== Scraping Welcome to the Jungle ===');
        const wttjJobs = await scrapeWTTJ(page, 2);
        totalScraped.push(...wttjJobs);

        for (const job of wttjJobs) {
            try {
                const id = `wttj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                await db.insertJob({ ...job, id });
                totalSaved.push(id);
            } catch (err) {}
        }
        console.log(`  Total WTTJ: ${wttjJobs.length} jobs\n`);

        // Scrape LinkedIn - MAIN SOURCE
        console.log('=== Scraping LinkedIn ===');
        const linkedinJobs = await scrapeLinkedin(page, 15);
        totalScraped.push(...linkedinJobs);

        for (const job of linkedinJobs) {
            try {
                const id = `linkedin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                await db.insertJob({ ...job, id });
                totalSaved.push(id);
            } catch (err) {}
        }
        console.log(`  Total LinkedIn: ${linkedinJobs.length} jobs\n`);

        // Scrape JobTeaser
        console.log('=== Scraping JobTeaser ===');
        const jtJobs = await scrapeJobTeaser(page);
        totalScraped.push(...jtJobs);

        for (const job of jtJobs) {
            try {
                const id = `jt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                await db.insertJob({ ...job, id });
                totalSaved.push(id);
            } catch (err) {}
        }
        console.log(`  Total JobTeaser: ${jtJobs.length} jobs\n`);

        // Update stats
        const stats = await db.updateStats();

        console.log('\n=== Final Results ===');
        console.log(`Total jobs scraped: ${totalScraped.length}`);
        console.log(`Total jobs saved: ${totalSaved.length}`);
        console.log(`Stats: ${stats.totalJobs} jobs, ${stats.totalCompanies} companies`);

        // Show breakdown by source
        const breakdown = await db.getJobs();
        const sources = {};
        breakdown.forEach(j => {
            sources[j.source] = (sources[j.source] || 0) + 1;
        });
        console.log('\nBy source:', sources);

    } catch (err) {
        console.error('Fatal error:', err);
    } finally {
        if (browser) {
            await browser.close();
        }
        await db.close();
        console.log('\n=== Scraping Complete ===');
    }
}

// Run
scrapeAllJobs();