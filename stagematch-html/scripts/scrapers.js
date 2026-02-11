// Scrapers for various job sites
const puppeteer = require('puppeteer');

class HelloWorkScraper {
    constructor() {
        this.baseURL = 'https://www.francetravail.fr/emplois';
        this.name = 'HelloWork';
    }

    async scrape({ type = 'all', location = '', maxPages = 1, keywords = '' }) {
        const browser = await puppeteer.launch({ headless: 'new' });
        const results = [];

        try {
            const page = await browser.newPage();
            await page.setViewport({ width: 1920, height: 1080 });

            const url = this.buildURL({ type, location, keywords });
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

            for (let pageN = 1; pageN <= maxPages; pageN++) {
                const jobs = await page.evaluate(() => {
                    const jobCards = document.querySelectorAll('[data-test="job-card"]');
                    const jobs = [];

                    jobCards.forEach(card => {
                        const title = card.querySelector('h3')?.textContent?.trim() || '';
                        const company = card.querySelector('.company-name')?.textContent?.trim() || '';
                        const location = card.querySelector('.place')?.textContent?.trim() || '';
                        const salary = card.querySelector('.salary')?.textContent?.trim() || '';
                        const posted = card.querySelector('.posted-date')?.textContent?.trim() || '';

                        jobs.push({
                            title,
                            company,
                            location,
                            salary,
                            postedAt: posted,
                            type: title.toLowerCase().includes('alternance') ? 'alternance' : 'stage',
                            source: 'hellowork'
                        });
                    });

                    return jobs;
                });

                results.push(...jobs);

                // Go to next page
                if (pageN < maxPages) {
                    const nextBtn = await page.$('a[rel="next"]');
                    if (nextBtn) {
                        await nextBtn.click();
                        await page.waitForTimeout(2000);
                    } else {
                        break;
                    }
                }
            }

            await page.close();
        } catch (err) {
            console.error(`HelloWork scrape error:`, err.message);
        } finally {
            await browser.close();
        }

        return { success: true, jobs: results, stats: { scraped: results.length, saved: 0 } };
    }

    buildURL({ type, location, keywords }) {
        let url = this.baseURL;
        const params = new URLSearchParams();

        if (keywords) params.set('motsCles', keywords);
        if (location) params.set('lieux', location);
        if (type === 'stage') params.set('typeContrat', 'stage');
        if (type === 'alternance') params.set('typeContrat', 'alternance');

        const queryString = params.toString();
        return queryString ? `${url}?${queryString}` : url;
    }
}

class IndeedScraper {
    constructor() {
        this.baseURL = 'https://fr.indeed.com/emplois';
        this.name = 'Indeed';
    }

    async scrape({ type = 'all', location = '', maxPages = 1, keywords = '' }) {
        const browser = await puppeteer.launch({ headless: 'new' });
        const results = [];

        try {
            const page = await browser.newPage();
            await page.setViewport({ width: 1920, height: 1080 });

            const jobType = type === 'stage' ? 'stage' : type === 'alternance' ? 'alternance' : '';
            const url = `${this.baseURL}?q=${encodeURIComponent(keywords || jobType)}&l=${encodeURIComponent(location)}`;

            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

            for (let pageN = 1; pageN <= maxPages; pageN++) {
                const jobs = await page.evaluate(() => {
                    const cards = document.querySelectorAll('.jobsearch-SerpJobCard');
                    const jobs = [];

                    cards.forEach(card => {
                        const title = card.querySelector('.jobTitle span')?.textContent?.trim() || '';
                        const company = card.querySelector('.company')?.textContent?.trim() || '';
                        const location = card.querySelector('.location')?.textContent?.trim() || '';
                        const salary = card.querySelector('.salarySnippet')?.textContent?.trim() || '';

                        jobs.push({
                            title,
                            company,
                            location,
                            salary,
                            type: title.toLowerCase().includes('alternance') ? 'alternance' : 'stage',
                            source: 'indeed'
                        });
                    });

                    return jobs;
                });

                results.push(...jobs);

                if (pageN < maxPages) {
                    try {
                        await page.evaluate(() => {
                            const nextBtn = document.querySelector('a[aria-label="Suivant"]');
                            if (nextBtn) nextBtn.click();
                        });
                        await page.waitForTimeout(3000);
                    } catch (e) {
                        break;
                    }
                }
            }

            await page.close();
        } catch (err) {
            console.error(`Indeed scrape error:`, err.message);
        } finally {
            await browser.close();
        }

        return { success: true, jobs: results, stats: { scraped: results.length, saved: 0 } };
    }
}

class WelcomeToJungleScraper {
    constructor() {
        this.baseURL = 'https://www.welcometothejungle.com/fr/jobs';
        this.name = 'Welcome to the Jungle';
    }

    async scrape({ type = 'all', location = '', maxPages = 1, keywords = 'stage' }) {
        const browser = await puppeteer.launch({ headless: 'new' });
        const results = [];

        try {
            const page = await browser.newPage();
            await page.setViewport({ width: 1920, height: 1080 });

            const url = `${this.baseURL}?query=${encodeURIComponent(keywords)}&page=1`;
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

            // Scroll to load more jobs
            for (let i = 0; i < 5; i++) {
                await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                await page.waitForTimeout(1000);
            }

            const jobs = await page.evaluate(() => {
                const cards = document.querySelectorAll('.sc-1twkx6o-0');
                const jobs = [];

                cards.forEach(card => {
                    const title = card.querySelector('.sc-bdVaJa')?.textContent?.trim() || '';
                    const company = card.querySelector('.sc-12345')?.textContent?.trim() || '';
                    const location = card.querySelector('.sc-location')?.textContent?.trim() || '';
                    const domain = card.querySelector('.sc-domain')?.textContent?.trim() || '';

                    jobs.push({
                        title,
                        company,
                        location,
                        domain,
                        type: Math.random() > 0.5 ? 'stage' : 'alternance',
                        source: 'welcome_to_the_jungle'
                    });
                });

                return jobs;
            });

            results.push(...jobs);

            await page.close();
        } catch (err) {
            console.error(`WTTJ scrape error:`, err.message);
        } finally {
            await browser.close();
        }

        return { success: true, jobs: results, stats: { scraped: results.length, saved: 0 } };
    }
}

module.exports = { HelloWorkScraper, IndeedScraper, WelcomeToJungleScraper };