#!/usr/bin/env node

/**
 * JobStudent API Server
 * Serves job data from SQLite database
 */

const express = require('express');
const cors = require('cors');
const DatabaseManager = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database instance
let dbManager = null;

// Initialize
app.listen(PORT, async () => {
    console.log(`API Server running on port ${PORT}`);

    // Initialize database
    dbManager = new DatabaseManager();
    await dbManager.connect();
    await dbManager.initializeSchema();

    console.log('Database connected');
});

// GET /api/jobs - Search jobs
app.get('/api/jobs', async (req, res) => {
    try {
        const {
            query,
            location,
            type = 'all',
            studyLevel,
            domain,
            remote
        } = req.query;

        const filters = {
            query: query || undefined,
            location: location || undefined,
            type: type === 'all' ? undefined : type,
            studyLevel: studyLevel || undefined,
            domain: domain || undefined,
            remote: remote === 'true' ? true : (remote === 'false' ? false : undefined)
        };

        const jobs = await dbManager.getJobs(filters);
        res.json({ success: true, jobs });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/jobs/:id - Get single job
app.get('/api/jobs/:id', async (req, res) => {
    try {
        const job = await dbManager.getJobById(req.params.id);
        if (job) {
            res.json({ success: true, job });
        } else {
            res.status(404).json({ success: false, error: 'Job not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/stats - Get database stats
app.get('/api/stats', async (req, res) => {
    try {
        const stats = await dbManager.updateStats();
        res.json({
            success: true,
            stats: {
                totalJobs: stats.totalJobs,
                totalCompanies: stats.totalCompanies,
                totalApplications: stats.totalApplications
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/domains - Get domain list
app.get('/api/domains', (req, res) => {
    const domains = [
        'Tech & IT',
        'Marketing',
        'Finance',
        'Data Science',
        'Consulting',
        'Ressources Humaines',
        'Design',
        'Commerce',
        'Communication',
        'Juridique',
        'Health',
        'Education',
        'Engineering',
        'Science',
        'Art',
        'Media',
        'Hospitality',
        'Transport',
        'Public Service',
        'International'
    ];
    res.json({ success: true, domains });
});

// GET /api/study-levels - Get study levels
app.get('/api/study-levels', (req, res) => {
    const levels = [
        { value: 'bac', label: 'Bac' },
        { value: 'bac+1', label: 'Bac+1' },
        { value: 'bac+2', label: 'Bac+2' },
        { value: 'bac+3', label: 'Bac+3' },
        { value: 'bac+4', label: 'Bac+4' },
        { value: 'bac+5', label: 'Bac+5' },
        { value: 'bac+6+', label: 'Bac+6 et plus' }
    ];
    res.json({ success: true, levels });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('Shutting down server...');
    if (dbManager) {
        await dbManager.close();
    }
    process.exit(0);
});