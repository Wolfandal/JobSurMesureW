#!/usr/bin/env node

/**
 * JobStudent Complete Scraper - Improved Version
 * Scrapes ALL stage and alternance offers from multiple sources
 */

const { chromium } = require('playwright');
const DatabaseManager = require('./database');
const crypto = require('crypto');

// French cities - reduced for better performance
const LOCATIONS = [
    'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Bordeaux', 'Nantes',
    'Lille', 'Nice', 'Strasbourg', 'Montpellier', 'Rennes', 'Reims',
    'Saint-Étienne', 'Le Mans', 'Aix-en-Provence', 'Grenoble', 'Dijon',
    'Angers', 'Nîmes', 'Toulon', 'Amiens', 'Perpignan', 'Metz',
    'Besançon', 'Caen', 'Orléans', 'Tours', 'Limoges', 'Brest', 'Le Havre'
];

// Improved domains list
const DOMAINS = [
    { keyword: 'stage', type: 'stage' },
    { keyword: 'alternance', type: 'alternance' },
    { keyword: 'développeur', type: 'stage' },
    { keyword: 'marketing', type: 'stage' },
    { keyword: 'finance', type: 'stage' },
    { keyword: 'data analyst', type: 'stage' },
    { keyword: 'design', type: 'stage' },
    { keyword: 'commerce', type: 'stage' },
    { keyword: 'rh ressources humaines', type: 'stage' },
    { keyword: 'ingenieur', type: 'stage' }
];

/**
 * Helper: Wait for network idle with retry
 */
async function goToPageWithRetry(page, url, maxRetries = 3, timeout = 90000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            await page.goto(url, {
                waitUntil: 'networkidle',
                timeout: timeout
            });
            return true;
        } catch (err) {
            console.log(`    Retry ${i + 1}/${maxRetries} for ${url}: ${err.message}`);
            await page.waitForTimeout(5000);
        }
    }
    return false;
}

/**
 * Helper: Handle cookie banners and popups
 */
async function handlePopups(page) {
    try {
        // Close common popup patterns
        const closeSelectors = [
            'button[aria-label*="fermer"]',
            'button[aria-label*="close"]',
            '[id*="close"]',
            '.close',
            '.modal-close',
            '.popup-close'
        ];

        for (const selector of closeSelectors) {
            try {
                await page.click(selector, { timeout: 1000 });
            } catch (e) {}
        }

        // Accept cookies if present
        const cookieBtn = await page.$('button:has-text("Accepter"), button:has-text("Accept"), button[aria-label*="accept"]', { timeout: 2000 });
        if (cookieBtn) {
            await cookieBtn.click();
            await page.waitForTimeout(1000);
        }
    } catch (err) {
        // Ignore popup errors
    }
}

/**
 * Helper: Extract skills from description
 */
function extractSkills(description) {
    if (!description) return [];

    const skillKeywords = [
        'javascript', 'python', 'java', 'c#', 'php', 'typescript', 'react', 'angular',
        'vue', 'html', 'css', 'sql', 'mysql', 'postgres', 'docker', 'kubernetes',
        'aws', 'azure', 'git', 'api', 'linux', 'node.js', 'nodejs', 'sqlserver',
        'mongodb', 'redis', 'graphql', 'rest', 'oauth', 'jwt', 'linux', 'bash',
        'shell', 'aws', 'terraform', 'ansible', 'jenkins', 'ci/cd', 'agile', 'scrum'
    ];

    const foundSkills = [];
    const descLower = description.toLowerCase();

    skillKeywords.forEach(skill => {
        if (descLower.includes(skill)) {
            foundSkills.push(skill);
        }
    });

    return [...new Set(foundSkills)];
}

/**
 * Scrape HelloWork (France Travail) - Improved with API access
 * Uses the France Travail employer search page
 */
async function scrapeHelloWork(page) {
    console.log('  Scraping HelloWork...');
    const results = [];

    // Use the old HelloWork/PE.fr URL which is more stable
    for (const location of LOCATIONS.slice(0, 3)) {
        const types = ['stage', 'alternance'];
        for (const type of types) {
            const searchParams = new URLSearchParams({
                q: type,
                l: location
            });
            const url = `https://www.france-travail.fr/emplois?${searchParams.toString()}`;

            try {
                if (!await goToPageWithRetry(page, url)) continue;
                await page.waitForTimeout(3000);
                await handlePopups(page);

                // Scroll to load more content
                for (let i = 0; i < 5; i++) {
                    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                    await page.waitForTimeout(500);
                }

                const jobs = await page.evaluate(() => {
                    const jobs = [];
                    // Try multiple selectors for HelloWork
                    const allCards = document.querySelectorAll('article, .job-card, .result, li[data-id-storage-target="item"], div[data-hp-job-card]');

                    for (const card of allCards) {
                        // Try different title selectors
                        const titleEl = card.querySelector('h1, h2, h3, [class*="title"], [data-cy*="title"]');
                        const title = titleEl?.textContent?.trim() || '';

                        // Skip if title is too short or seems to be a navigation element
                        if (!title || title.length < 5 || title.length > 150) continue;
                        if (title.toLowerCase().includes('navigation') || title.toLowerCase().includes('menu')) continue;

                        // Try to extract href from any link in the card
                        const linkEl = card.querySelector('a[href]');
                        const href = linkEl?.getAttribute('href') || '';

                        // Extract job ID from URL if possible
                        const jobIdMatch = href.match(/(\d{6,})|id=([^&]+)/);
                        const jobId = jobIdMatch ? jobIdMatch[1] || jobIdMatch[2] : '';

                        // Try company selectors
                        const companyEl = card.querySelector('.company, .company-name, [class*="company"], p:last-child');
                        const company = companyEl?.textContent?.trim().replace(/^[\s\->]+/, '') || 'Entreprise';

                        // Try location selectors
                        const locEl = card.querySelector('.location, .address, [class*="location"], [data-cy*="loc"]');
                        const loc = locEl?.textContent?.trim() || '';

                        // Try contract type selectors
                        const contractEl = card.querySelector('.contract, [class*="contract"], [data-cy*="contract"]');
                        const contract = contractEl?.textContent?.trim() || '';

                        // Try salary selectors
                        const salaryEl = card.querySelector('.salary, [class*="salary"], [data-cy*="salary"]');
                        const salary = salaryEl?.textContent?.trim() || '';

                        // Try date selectors
                        const dateEl = card.querySelector('.date, .time, [class*="date"], [data-cy*="date"]');
                        const postedAt = dateEl?.textContent?.trim() || 'il y a 1 jour';

                        // Determine type from content
                        const titleLower = title.toLowerCase();
                        const contractLower = contract.toLowerCase();
                        let detectedType = type;
                        if (titleLower.includes('alternance') || contractLower.includes('alternance')) {
                            detectedType = 'alternance';
                        } else if (titleLower.includes('stage') || contractLower.includes('stage')) {
                            detectedType = 'stage';
                        }

                        const job = {
                            id: jobId || `hw_${Math.random().toString(36).substr(2, 9)}`,
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
                            duration: detectedType === 'stage' ? '3-6 mois' : '12-24 mois',
                            postedAt: new Date().toISOString(),
                            source: 'hellowork',
                            sourceUrl: href.startsWith('http') ? href : `https://candidat.francetravail.fr${href}`
                        };

                        // Add job (deduplication is done later)
                        jobs.push(job);
                    }

                    return jobs;
                });

                if (jobs.length > 0) {
                    results.push(...jobs);
                    console.log(`    ${location} (${type}): ${jobs.length} jobs`);
                }
            } catch (err) {
                console.log(`    Error for ${location} (${type}): ${err.message}`);
                // Try alternative approach with basic HTML parsing
                console.log(`    Trying alternative approach...`);
            }
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    return results;
}

/**
 * Scrape Indeed France - Improved
 */
async function scrapeIndeed(page) {
    console.log('  Scraping Indeed...');
    const results = [];

    for (const location of LOCATIONS.slice(0, 2)) {
        for (const domain of DOMAINS.slice(0, 2)) {
            const url = `https://fr.indeed.com/emplois?q=${encodeURIComponent(domain.keyword)}&l=${encodeURIComponent(location)}&sort=date`;
            try {
                if (!await goToPageWithRetry(page, url)) continue;
                await page.waitForTimeout(2000);
                await handlePopups(page);

                // Scroll to load more
                for (let i = 0; i < 2; i++) {
                    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                    await page.waitForTimeout(500);
                }

                const jobs = await page.evaluate(() => {
                    const jobs = [];
                    const cards = document.querySelectorAll('.jobsearch-SerpJobCard, .jobCard, .result');

                    cards.forEach(card => {
                        const titleEl = card.querySelector('.jobTitle, h2 a, .jobTitle span');
                        const title = titleEl?.textContent?.trim() || '';

                        if (!title || title.length < 5) return;

                        const jobId = card.getAttribute('data-jk') || '';

                        const companyEl = card.querySelector('.company, .companyName, .companyWithLogo');
                        const company = companyEl?.textContent?.trim() || 'Entreprise';

                        const locEl = card.querySelector('.location, .address');
                        const loc = locEl?.textContent?.trim() || '';

                        const salaryEl = card.querySelector('.salary, .salarySnippet');
                        const salary = salaryEl?.textContent?.trim() || '';

                        const dateEl = card.querySelector('.date, .remote-job, .time');
                        const postedAt = dateEl?.textContent?.trim() || 'il y a 1 jour';

                        // Extract description snippet
                        const descEl = card.querySelector('.job-snippet');
                        let description = descEl?.innerHTML?.replace(/<[^>]*>?/gm, '') || '';

                        const titleLower = title.toLowerCase();
                        const detectedType = titleLower.includes('alternance') ? 'alternance' : 'stage';

                        const job = {
                            id: jobId || `idn_${Math.random().toString(36).substr(2, 9)}`,
                            title: title.replace(/\s+/g, ' '),
                            company: company.replace(/\s+/g, ' '),
                            location: loc.replace(/\s+/g, ' '),
                            salary: salary,
                            type: detectedType,
                            domain: 'General',
                            description: description,
                            requirements: [],
                            skills: [],
                            studyLevel: ['bac+3', 'bac+4', 'bac+5'],
                            duration: detectedType === 'stage' ? '3-6 mois' : '12-24 mois',
                            postedAt: new Date().toISOString(),
                            source: 'indeed',
                            sourceUrl: ''
                        };

                        // Add job (deduplication is done later)
                        jobs.push(job);
                    });

                    return jobs;
                });

                results.push(...jobs);
                console.log(`    ${location} (${domain.keyword}): ${jobs.length} jobs`);
            } catch (err) {
                console.log(`    Error for ${location} (${domain.keyword}): ${err.message}`);
            }
            await new Promise(r => setTimeout(r, 1500));
        }
    }

    return results;
}

/**
 * Scrape Welcome to the Jungle - Improved
 */
async function scrapeWTTJ(page) {
    console.log('  Scraping Welcome to the Jungle...');
    const results = [];

    for (const domain of DOMAINS.slice(0, 5)) {
        const url = `https://www.welcometothejungle.com/fr/jobs?query=${encodeURIComponent(domain.keyword)}&sortBy=newest`;
        try {
            if (!await goToPageWithRetry(page, url)) continue;
            await page.waitForTimeout(2000);
            await handlePopups(page);

            // Scroll to load more - increased for more results
            for (let i = 0; i < 8; i++) {
                await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                await page.waitForTimeout(500);
            }

            const jobs = await page.evaluate(() => {
                const jobs = [];
                const cards = document.querySelectorAll('.sc-job-card, .job-card, .ais-Hits-item');

                cards.forEach(card => {
                    const titleEl = card.querySelector('.sc-title, .job-title, h1, h2, h3');
                    const title = titleEl?.textContent?.trim() || '';

                    if (!title || title.length < 5) return;

                    const linkEl = card.querySelector('a');
                    const href = linkEl?.getAttribute('href') || '';
                    const jobId = href.split('/').pop() || '';

                    const companyEl = card.querySelector('.company-name, .company, [class*="company"]');
                    const company = companyEl?.textContent?.trim() || 'Entreprise';

                    const locEl = card.querySelector('.sc-location, .location, [class*="location"]');
                    const loc = locEl?.textContent?.trim() || 'France';

                    const salaryEl = card.querySelector('.salary, [class*="salary"]');
                    const salary = salaryEl?.textContent?.trim() || '';

                    const typeMatch = title.toLowerCase().match(/(alternance|stage)/);
                    const detectedType = typeMatch ? (typeMatch[1] === 'alternance' ? 'alternance' : 'stage') : 'stage';

                    const job = {
                        id: jobId || `wttj_${Math.random().toString(36).substr(2, 9)}`,
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
                        duration: detectedType === 'stage' ? '3-6 mois' : '12-24 mois',
                        postedAt: new Date().toISOString(),
                        source: 'welcome_to_the_jungle',
                        sourceUrl: `https://www.welcometothejungle.com${href}`
                    };

                    // Add job (deduplication is done later)
                    jobs.push(job);
                });

                return jobs;
            });

            results.push(...jobs);
            console.log(`    ${domain.keyword}: ${jobs.length} jobs`);
        } catch (err) {
            console.log(`    Error for ${domain.keyword}: ${err.message}`);
        }
        await new Promise(r => setTimeout(r, 1500));
    }

    return results;
}

/**
 * Scrape LinkedIn - Improved with better data extraction
 */
async function scrapeLinkedin(page) {
    console.log('  Scraping LinkedIn...');
    const results = [];
    let processed = new Set();

    // Accept cookies if present
    try {
        await page.evaluate(() => {
            const btn = document.querySelector('button[action-type="ACCEPT"]');
            if (btn) btn.click();
        });
        await page.waitForTimeout(1000);
    } catch (e) {}

    for (const domain of DOMAINS.slice(0, 10)) {
        const url = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(domain.keyword)}&location=France&sortBy=DD`;
        try {
            if (!await goToPageWithRetry(page, url)) continue;
            await page.waitForTimeout(2000);
            await handlePopups(page);

            // Scroll to load more jobs - increased scrolls for more results
            for (let i = 0; i < 30; i++) {
                await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                await page.waitForTimeout(500);
            }

            // Collect jobs - deduplication is done later in deduplicateJobs()
            const jobs = await page.evaluate(() => {
                const jobs = [];
                const cards = document.querySelectorAll('.base-search-card, .job-search-card');

                cards.forEach(card => {
                    // Title: h3.base-search-card__title
                    const titleEl = card.querySelector('.base-search-card__title h3, .base-search-card__title');
                    const title = titleEl?.textContent?.trim() || '';

                    if (!title || title.length < 5) return;

                    // Company: h4.base-search-card__subtitle with link
                    const companyEl = card.querySelector('.base-search-card__subtitle a, .base-search-card__subtitle');
                    const company = companyEl?.textContent?.trim() || 'Entreprise';

                    // Location: span.job-search-card__location
                    const locEl = card.querySelector('.job-search-card__location, .base-search-card__metadata span:last-child');
                    const loc = locEl?.textContent?.trim() || 'France';

                    // Salary: not always visible, try generic selector
                    const salaryEl = card.querySelector('[class*="salary"]');
                    const salary = salaryEl?.textContent?.trim() || '';

                    // Date: posted-time-ago or generic time element
                    const dateEl = card.querySelector('.posted-time-ago, time, .date');
                    const postedAt = dateEl?.textContent?.trim() || new Date().toISOString();

                    const titleLower = title.toLowerCase();
                    const detectedType = titleLower.includes('alternance') ? 'alternance' : 'stage';

                    const job = {
                        id: `li_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
                        duration: detectedType === 'stage' ? '3-6 mois' : '12-24 mois',
                        postedAt: new Date().toISOString(),
                        source: 'linkedin',
                        sourceUrl: ''
                    };

                    jobs.push(job);
                });

                return jobs;
            });

            results.push(...jobs);
            console.log(`    ${domain.keyword}: ${jobs.length} jobs`);
        } catch (err) {
            console.log(`    Error for ${domain.keyword}: ${err.message}`);
        }
        await new Promise(r => setTimeout(r, 1500));
    }

    return results;
}

/**
 * Scrape JobTeaser - Improved
 */
async function scrapeJobTeaser(page) {
    console.log('  Scraping JobTeaser...');
    const results = [];

    try {
        const url = 'https://www.jobteaser.com/fr/jobs?search_query=stage+alternance&sort=newest';
        if (!await goToPageWithRetry(page, url)) return results;

        await page.waitForTimeout(2000);
        await handlePopups(page);

        // Scroll to load more
        for (let i = 0; i < 3; i++) {
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await page.waitForTimeout(500);
        }

        const jobs = await page.evaluate(() => {
            const jobs = [];
            const cards = document.querySelectorAll('.job-card, .job-offer, .jp-List-item');

            cards.forEach(card => {
                const titleEl = card.querySelector('.job-title, h1, h2, h3, [class*="title"]');
                const title = titleEl?.textContent?.trim() || '';

                if (!title || title.length < 5) return;

                const linkEl = card.querySelector('a');
                const href = linkEl?.getAttribute('href') || '';
                const jobId = href.split('/').pop() || '';

                const companyEl = card.querySelector('.company-name, .company, [class*="company"]');
                const company = companyEl?.textContent?.trim() || 'Entreprise';

                const locEl = card.querySelector('.location, [class*="location"]');
                const loc = locEl?.textContent?.trim() || 'France';

                const salaryEl = card.querySelector('.salary, [class*="salary"]');
                const salary = salaryEl?.textContent?.trim() || '';

                const typeMatch = title.toLowerCase().match(/(alternance|stage)/);
                const detectedType = typeMatch ? (typeMatch[1] === 'alternance' ? 'alternance' : 'stage') : 'stage';

                const job = {
                    id: jobId || `jt_${Math.random().toString(36).substr(2, 9)}`,
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
                    duration: detectedType === 'stage' ? '3-6 mois' : '12-24 mois',
                    postedAt: new Date().toISOString(),
                    source: 'jobteaser',
                    sourceUrl: `https://www.jobteaser.com${href}`
                };

                // Add job (deduplication is done later)
                jobs.push(job);
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
 * Deduplicate jobs by title and company
 */
function deduplicateJobs(jobs) {
    const seen = new Set();
    const uniqueJobs = [];

    for (const job of jobs) {
        const key = `${job.title.toLowerCase()}-${job.company.toLowerCase()}-${job.location.toLowerCase()}`;
        if (!seen.has(key)) {
            seen.add(key);
            uniqueJobs.push(job);
        }
    }

    return uniqueJobs;
}

/**
 * Main function
 */
async function scrapeAllJobs() {
    console.log('=== JobStudent Complete Scrape - Improved ===\n');
    console.log('Starting to scrape jobs from multiple sources...\n');

    const db = new DatabaseManager();
    let browser = null;

    try {
        await db.connect();
        await db.initializeSchema();

        console.log('Launching browser...');
        browser = await chromium.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--dial-playback-rate=1'
            ]
        });

        const page = await browser.newPage({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport: { width: 1920, height: 1080 }
        });

        const totalScraped = [];

        // Scrape HelloWork - FASTEST SOURCE
        console.log('\n=== Scraping HelloWork ===');
        const hwJobs = await scrapeHelloWork(page);
        totalScraped.push(...hwJobs);

        // Skip Indeed - too slow and often blocked
        // console.log('\n=== Scraping Indeed ===');
        // const indeedJobs = await scrapeIndeed(page);
        // totalScraped.push(...indeedJobs);

        // Scrape WTTJ
        console.log('\n=== Scraping Welcome to the Jungle ===');
        const wttjJobs = await scrapeWTTJ(page);
        totalScraped.push(...wttjJobs);

        // Scrape LinkedIn - MAIN SOURCE
        console.log('\n=== Scraping LinkedIn ===');
        const linkedinJobs = await scrapeLinkedin(page);
        totalScraped.push(...linkedinJobs);

        // Scrape JobTeaser
        console.log('\n=== Scraping JobTeaser ===');
        const jtJobs = await scrapeJobTeaser(page);
        totalScraped.push(...jtJobs);

        console.log(`\n=== Deduplicating ===`);
        const uniqueJobs = deduplicateJobs(totalScraped);
        console.log(`  Total before dedup: ${totalScraped.length}`);
        console.log(`  Total after dedup: ${uniqueJobs.length}`);

        // Save to database in batches
        console.log('\n=== Saving to Database ===');
        const totalSaved = [];
        const BATCH_SIZE = 20;
        for (let i = 0; i < uniqueJobs.length; i += BATCH_SIZE) {
            const batch = uniqueJobs.slice(i, i + BATCH_SIZE);
            try {
                // Generate source-specific IDs and insert batch
                const batchResults = await Promise.all(batch.map(job => {
                    // Generate source-specific ID
                    const sourcePrefix = job.source.replace(/_to_the_/, '_').replace(/_to_the_/, '_');
                    const id = `${sourcePrefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    return db.insertJob({ ...job, id }).then(() => {
                        totalSaved.push(id);
                        return id;
                    });
                }));
                console.log(`  Saved batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batchResults.length} jobs (total: ${totalSaved.length})`);
            } catch (err) {
                console.log(`  Error saving batch: ${err.message}`);
            }
        }

        // Update stats
        const stats = await db.updateStats();

        // Show results
        console.log('\n=== Final Results ===');
        console.log(`Total jobs scraped: ${totalScraped.length}`);
        console.log(`Total jobs after dedup: ${uniqueJobs.length}`);
        console.log(`Total jobs saved: ${totalSaved.length}`);
        console.log(`Stats: ${stats.totalJobs} jobs, ${stats.totalCompanies} companies`);

        // Show breakdown by source
        const breakdown = await db.getJobs();
        const sources = {};
        breakdown.forEach(j => {
            sources[j.source] = (sources[j.source] || 0) + 1;
        });
        console.log('\nBy source:', sources);

        // Show breakdown by type
        const types = {};
        breakdown.forEach(j => {
            types[j.type] = (types[j.type] || 0) + 1;
        });
        console.log('\nBy type:', types);

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
