const DatabaseManager = require('./database');

async function check() {
    const d = new DatabaseManager();
    await d.connect();
    const jobs = await d.getJobs();
    console.log('Jobs in DB:', jobs.length);
    jobs.slice(0, 10).forEach(j => {
        console.log('- ', j.source, '|', j.title, '|', j.company, '|', j.type);
    });
    await d.close();
}

check();