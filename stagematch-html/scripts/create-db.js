#!/usr/bin/env node

/**
 * JobStudent Database Creator
 * Creates a comprehensive SQLite database with job offers
 */

const DatabaseManager = require('./database');
const fs = require('fs');
const path = require('path');

// Sample job data for different domains
const SAMPLE_JOBS = [
    // Tech & IT - Développeurs
    {
        title: 'Développeur Full Stack Junior',
        company: 'TechStartup Paris',
        companyLogo: 'https://ui-avatars.com/api/?name=TS&background=3b82f6&color=fff',
        location: 'Paris, France',
        type: 'alternance',
        domain: 'Tech & IT',
        description: `Rejoignez une startup en pleine croissance pour développer des applications web innovantes.

Vos missions :
- Développement de nouvelles fonctionnalités front-end et back-end
- Participation aux revues de code et à l'amélioration continue
- Collaboration avec l'équipe produit pour définir les spécifications
- Mise en place de tests automatisés

Environnement technique : React, Node.js, PostgreSQL, AWS`,
        requirements: [
            'Formation en informatique (Bac+3 à Bac+5)',
            'Connaissance de JavaScript/TypeScript',
            'Esprit d\'équipe et bonne communication',
            'Curiosité et envie d\'apprendre'
        ],
        skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Git'],
        studyLevel: ['bac+3', 'bac+4', 'bac+5'],
        duration: '12 mois',
        salary: '1 200€ - 1 500€/mois',
        startDate: '2026-03-01',
        postedAt: new Date('2026-01-25'),
        deadline: '2026-02-15',
        remote: true,
        matchScore: 92,
        source: 'mock'
    },
    {
        title: 'Développeur Front-end React',
        company: 'Digital Agency Lyon',
        companyLogo: 'https://ui-avatars.com/api/?name=DA&background=f59e0b&color=fff',
        location: 'Lyon, France',
        type: 'stage',
        domain: 'Tech & IT',
        description: `Vous participerez à la création d'interfaces web modernes et réactives pour nos clients.

Vos missions :
- Développement d'applications React
- Intégration des maquettes Figma
- Optimisation des performances
- Tests unitaires et E2E`,
        requirements: ['Maîtrise de React et JavaScript', 'Connaissance de TypeScript', 'Experience avec React Testing Library'],
        skills: ['React', 'TypeScript', 'JavaScript', 'CSS', 'Figma', 'Testing'],
        studyLevel: ['bac+3', 'bac+4'],
        duration: '6 mois',
        salary: '1 000€/mois',
        startDate: '2026-04-01',
        postedAt: new Date('2026-01-20'),
        remote: false,
        matchScore: 78,
        source: 'mock'
    },
    {
        title: 'Développeur Back-end Node.js',
        company: 'Bank Paris',
        companyLogo: 'https://ui-avatars.com/api/?name=BP&background=00965e&color=fff',
        location: 'La Défense, France',
        type: 'alternance',
        domain: 'Tech & IT',
        description: `Vous développerez des API RESTful et des microservices pour les applications bancaires.

Vos missions :
- Conception et développement d'API REST
- Intégration avec les bases de données PostgreSQL
- Mise en place de tests automatisés
- Optimisation des performances`,
        requirements: ['Expérience avec Node.js', 'Connaissance de PostgreSQL', 'Experience avec Docker'],
        skills: ['Node.js', 'Express', 'PostgreSQL', 'Docker', 'Redis', 'REST API'],
        studyLevel: ['bac+4', 'bac+5'],
        duration: '24 mois',
        salary: '1 400€ - 1 800€/mois',
        startDate: '2026-09-01',
        postedAt: new Date('2026-01-28'),
        remote: true,
        matchScore: 85,
        source: 'mock'
    },
    // Data & AI
    {
        title: 'Data Analyst Junior',
        company: 'BNP Paribas',
        companyLogo: 'https://ui-avatars.com/api/?name=BNP&background=00965e&color=fff',
        location: 'La Défense, France',
        type: 'alternance',
        domain: 'Data Science',
        description: `Vous analyseriez les données business et créeriez des dashboards de reporting.

Vos missions :
- Analyse de données clients et commerciales
- Création de dashboards Power BI/Tableau
- Génération de rapports automatisés
- Support aux équipes métiers`,
        requirements: ['Maîtrise de SQL et Python', 'Connaissance des outils de BI', 'Rigueur analytique'],
        skills: ['Python', 'SQL', 'Power BI', 'Tableau', 'Excel', 'Statistics'],
        studyLevel: ['bac+4', 'bac+5'],
        duration: '24 mois',
        salary: '1 400€ - 1 800€/mois',
        startDate: '2026-09-01',
        postedAt: new Date('2026-01-28'),
        remote: true,
        matchScore: 85,
        source: 'mock'
    },
    // Marketing
    {
        title: 'Stage Marketing Digital',
        company: 'L\'Oréal',
        companyLogo: 'https://ui-avatars.com/api/?name=LO&background=e11d48&color=fff',
        location: 'Clichy, France',
        type: 'stage',
        domain: 'Marketing',
        description: `Intégrez l'équipe marketing digital d'une marque leader mondiale.

Vos missions :
- Gestion des réseaux sociaux et création de contenu
- Analyse des performances des campagnes
- Participation au lancement de nouveaux produits
- Veille concurrentielle`,
        requirements: ['Formation en marketing', 'Créativité', 'Maîtrise des outils digitaux'],
        skills: ['Social Media', 'Google Analytics', 'SEO', 'Content Marketing', 'Canva'],
        studyLevel: ['bac+4', 'bac+5'],
        duration: '6 mois',
        salary: '1 000€/mois',
        startDate: '2026-04-01',
        postedAt: new Date('2026-01-20'),
        remote: false,
        matchScore: 78,
        source: 'mock'
    },
    // Finance
    {
        title: 'Stage Contrôle de Gestion',
        company: 'Total Energies',
        companyLogo: 'https://ui-avatars.com/api/?name=TE&background=f57c00&color=fff',
        location: 'Paris, France',
        type: 'stage',
        domain: 'Finance',
        description: `Vous participerez à l'analyse financière des projets et au reporting.

Vos missions :
- Analyse des coûts et marges
- Préparation de rapports financiers
- Support à la décision managériale
- Optimisation des processus de reporting`,
        requirements: ['Formation en finance/contrôle de gestion', 'Maîtrise d\'Excel', 'Autonomie'],
        skills: ['Excel', 'PowerPoint', 'Financial Analysis', 'ERP', 'P&L'],
        studyLevel: ['bac+4', 'bac+5'],
        duration: '6 mois',
        salary: '1 200€/mois',
        startDate: '2026-03-01',
        postedAt: new Date('2026-01-15'),
        remote: false,
        matchScore: 82,
        source: 'mock'
    },
    // Consulting
    {
        title: 'Stage Consultant Junior',
        company: 'Deloitte',
        companyLogo: 'https://ui-avatars.com/api/?name=D&background=2563eb&color=fff',
        location: 'Paris, France',
        type: 'stage',
        domain: 'Consulting',
        description: `Vous accompagnerez nos clients dans leurs projets de transformation.

Vos missions :
- Analyse des besoins clients
- Préparation de livrables et présentations
- Support à la mise en œuvre des solutions
- Animation d'ateliers collaboratifs`,
        requirements: ['Excellentes capacités d\'analyse', 'Bonnes compétences en communication', 'Maîtrise de la suite Office'],
        skills: ['Analyse', 'PowerPoint', 'Excel', 'Project Management', 'Communication'],
        studyLevel: ['bac+4', 'bac+5'],
        duration: '6 mois',
        salary: '1 100€/mois',
        startDate: '2026-03-15',
        postedAt: new Date('2026-01-22'),
        remote: false,
        matchScore: 71,
        source: 'mock'
    },
    // Engineering
    {
        title: 'Ingénieur DevOps Junior',
        company: 'OVHcloud',
        companyLogo: 'https://ui-avatars.com/api/?name=OVH&background=000e9c&color=fff',
        location: 'Roubaix, France',
        type: 'alternance',
        domain: 'Tech & IT',
        description: `Vous automatiserez les déploiements et gérerez nos infrastructures cloud.

Vos missions :
- CI/CD pipeline automation
- Monitoring et alerting
- Scripting et développement d'outils
- Gestion des incidents`,
        requirements: ['Connaissance de Linux et Docker', 'Scripting (Python/Bash)', 'Intérêt pour le cloud'],
        skills: ['Docker', 'Kubernetes', 'Linux', 'CI/CD', 'Python', 'Terraform', 'AWS'],
        studyLevel: ['bac+4', 'bac+5'],
        duration: '24 mois',
        salary: '1 500€ - 1 800€/mois',
        startDate: '2026-09-01',
        postedAt: new Date('2026-01-27'),
        remote: true,
        matchScore: 79,
        source: 'mock'
    },
    // Design
    {
        title: 'Stage Design UX/UI',
        company: 'BlaBlaCar',
        companyLogo: 'https://ui-avatars.com/api/?name=BB&background=00aff5&color=fff',
        location: 'Paris, France',
        type: 'stage',
        domain: 'Design',
        description: `Vous créerez des expériences utilisateur pour des millions d'utilisateurs.

Vos missions :
- Maquettage et prototypage
- Tests utilisateurs
- Contribution au design system
- Collaboration avec les équipes produit`,
        requirements: ['Formation en design digital', 'Maîtrise de Figma', 'Portfolio démontrant votre créativité'],
        skills: ['Figma', 'Adobe XD', 'Prototypage', 'User Research', 'Design System'],
        studyLevel: ['bac+3', 'bac+4', 'bac+5'],
        duration: '6 mois',
        salary: '1 000€/mois',
        startDate: '2026-04-01',
        postedAt: new Date('2026-01-23'),
        remote: true,
        matchScore: 73,
        source: 'mock'
    },
    // HR
    {
        title: 'Stage Ressources Humaines',
        company: 'Decathlon',
        companyLogo: 'https://ui-avatars.com/api/?name=DE&background=0082c3&color=fff',
        location: 'Lille, France',
        type: 'stage',
        domain: 'Ressources Humaines',
        description: `Vous participerez aux differentes missions RH au sein d'un leader du sport.

Vos missions :
- Participation au processus de recrutement
- Organisation d'événements internes
- Gestion administrative du personnel
- Projets d'amélioration de la QVT`,
        requirements: ['Formation en RH', 'Aisance relationnelle', 'Organisation'],
        skills: ['Recrutement', 'Communication', 'Excel', 'Gestion administrative'],
        studyLevel: ['bac+3', 'bac+4', 'bac+5'],
        duration: '4 mois',
        salary: '800€/mois',
        startDate: '2026-05-01',
        postedAt: new Date('2026-01-24'),
        remote: false,
        matchScore: 65,
        source: 'mock'
    }
];

async function createDatabase() {
    console.log('Creating comprehensive job database...\n');

    const db = new DatabaseManager();

    try {
        // Connect and initialize
        await db.connect();
        await db.initializeSchema();

        console.log(`Inserting ${SAMPLE_JOBS.length} sample jobs...`);

        let inserted = 0;
        let failed = 0;

        for (let i = 0; i < SAMPLE_JOBS.length; i++) {
            const job = SAMPLE_JOBS[i];
            try {
                const id = (i + 1).toString(); // Use numeric IDs starting from 1
                await db.insertJob({ ...job, id });
                inserted++;
                console.log(`  ✓ Inserted: ${job.title} at ${job.company} (ID: ${id})`);
            } catch (err) {
                failed++;
                console.log(`  ✗ Failed: ${job.title} - ${err.message}`);
            }
        }

        // Update stats
        const stats = await db.updateStats();
        console.log(`\nDatabase updated:`);
        console.log(`  Total jobs: ${stats.totalJobs}`);
        console.log(`  Total companies: ${stats.totalCompanies}`);
        console.log(`  Total applications: ${stats.totalApplications}`);

        console.log(`\nResults: ${inserted} inserted, ${failed} failed`);

    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    } finally {
        await db.close();
    }
}

// Run if called directly
if (require.main === module) {
    createDatabase();
}

module.exports = { createDatabase, SAMPLE_JOBS };