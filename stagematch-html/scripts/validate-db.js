#!/usr/bin/env node

/**
 * Database Validator - Check the SQLite database
 */

const DatabaseManager = require('./database');

async function validateDatabase() {
    console.log('=== Validating Job Database ===\n');

    const db = new DatabaseManager();

    try {
        await db.connect();

        // Get total count
        const countResult = await new Promise((resolve, reject) => {
            db.db.get('SELECT COUNT(*) as total FROM jobs', [], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        console.log(`Total jobs in database: ${countResult.total}`);

        // Get sample jobs
        const jobs = await new Promise((resolve, reject) => {
            db.db.all('SELECT * FROM jobs LIMIT 10', [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        console.log('\nSample jobs:');
        jobs.forEach((job, i) => {
            console.log(`\n${i + 1}. ${job.title}`);
            console.log(`   Company: ${job.company}`);
            console.log(`   Location: ${job.location}`);
            console.log(`   Type: ${job.type}`);
            console.log(`   Domain: ${job.domain}`);
            console.log(`   Source: ${job.source}`);
            console.log(`   Score: ${job.matchScore || 'N/A'}%`);
        });

        // Get stats
        const stats = await db.updateStats();
        console.log('\n=== Database Stats ===');
        console.log(`Total jobs: ${stats.totalJobs}`);
        console.log(`Total companies: ${stats.totalCompanies}`);
        console.log(`Total applications: ${stats.totalApplications}`);

        // Domain distribution
        const domains = await new Promise((resolve, reject) => {
            db.db.all('SELECT domain, COUNT(*) as count FROM jobs GROUP BY domain ORDER BY count DESC', [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        console.log('\nJobs by domain:');
        domains.forEach(d => {
            console.log(`  ${d.domain}: ${d.count}`);
        });

        // Type distribution
        const types = await new Promise((resolve, reject) => {
            db.db.all('SELECT type, COUNT(*) as count FROM jobs GROUP BY type', [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        console.log('\nJobs by type:');
        types.forEach(t => {
            console.log(`  ${t.type}: ${t.count}`);
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await db.close();
    }
}

validateDatabase();