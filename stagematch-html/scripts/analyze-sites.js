#!/usr/bin/env node

/**
 * Analyser la structure des sites de recrutement
 */

const { chromium } = require('playwright');

async function analyzeSites() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    console.log('=== Analyse des sites de recrutement ===\n');

    // Test France Travail (HelloWork)
    console.log('\n--- France Travail (HelloWork) ---');
    try {
        await page.goto('https://www.francetravail.fr/emplois', { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(3000);

        const hasJobCards = await page.$eval('.search-card', el => el !== null).catch(() => false);
        const hasJobCardClass = await page.$eval('.job-card', el => el !== null).catch(() => false);
        const hasResultCard = await page.$eval('.result-card', el => el !== null).catch(() => false);

        console.log('Classes disponibles:', {
            searchCard: hasJobCards,
            jobCard: hasJobCardClass,
            resultCard: hasResultCard,
            article: await page.$eval('article', el => el !== null).catch(() => false)
        });

        const jobCount = await page.evaluate(() => {
            const jobs = document.querySelectorAll('[class*="job"], [class*="card"], [class*="search"], [class*="result"]');
            return jobs.length;
        });
        console.log('Éléments avec job/card/search/result:', jobCount);

        // Save HTML for inspection
        require('fs').writeFileSync('francetravail.html', await page.content());
        console.log('HTML sauvegardé dans francetravail.html');
    } catch (err) {
        console.error('Error:', err.message);
    }

    // Test Indeed
    console.log('\n--- Indeed ---');
    try {
        await page.goto('https://fr.indeed.com/emplois?q=stage&l=Paris', { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(3000);

        const jobCount = await page.evaluate(() => {
            const cards = document.querySelectorAll('[class*="job"], [class*="card"]');
            return cards.length;
        });
        console.log('Éléments avec job/card:', jobCount);

        require('fs').writeFileSync('indeed.html', await page.content());
        console.log('HTML sauvegardé dans indeed.html');
    } catch (err) {
        console.error('Error:', err.message);
    }

    // Test WTTJ
    console.log('\n--- Welcome to the Jungle ---');
    try {
        await page.goto('https://www.welcometothejungle.com/fr/jobs?query=stage', { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(3000);

        const jobCount = await page.evaluate(() => {
            const cards = document.querySelectorAll('[class*="job"], [class*="card"], article');
            return cards.length;
        });
        console.log('Éléments avec job/card/article:', jobCount);

        require('fs').writeFileSync('wttj.html', await page.content());
        console.log('HTML sauvegardé dans wttj.html');
    } catch (err) {
        console.error('Error:', err.message);
    }

    // Test LinkedIn
    console.log('\n--- LinkedIn ---');
    try {
        await page.goto('https://www.linkedin.com/jobs/search?keywords=stage&location=France', { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(3000);

        const jobCount = await page.evaluate(() => {
            const jobs = document.querySelectorAll('[class*="job"], [class*="card"], [class*="base-search"]');
            return jobs.length;
        });
        console.log('Éléments avec job/card/base-search:', jobCount);

        require('fs').writeFileSync('linkedin.html', await page.content());
        console.log('HTML sauvegardé dans linkedin.html');
    } catch (err) {
        console.error('Error:', err.message);
    }

    await browser.close();
    console.log('\n=== Analyse terminée ===');
}

analyzeSites().catch(console.error);