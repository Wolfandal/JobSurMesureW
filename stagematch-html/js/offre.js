// Offre Page JavaScript

// Get job ID from URL
function getJobId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Mock job data
function getJobData() {
    return {
        id: '1',
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
        remote: true,
        matchScore: 92,
        sourceUrl: 'https://www.hellowork.com'
    };
}

function formatDate(date) {
    if (!date) return 'Date inconnue';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function displayJob(job) {
    document.getElementById('jobTitleDisplay').textContent = job.title;
    document.getElementById('jobCompany').textContent = job.company;
    document.getElementById('jobLocation').textContent = job.location;
    document.getElementById('jobDescription').textContent = job.description;
    document.getElementById('jobDuration').textContent = job.duration;
    document.getElementById('jobSalary').textContent = job.salary;
    document.getElementById('jobStartDate').textContent = formatDate(job.startDate);

    // Job type badge
    const typeBadge = document.getElementById('jobTypeBadge');
    if (job.type === 'stage') {
        typeBadge.textContent = '🎓 Stage';
        typeBadge.className = 'px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700';
    } else {
        typeBadge.textContent = '💼 Alternance';
        typeBadge.className = 'px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700';
    }

    // Score badge
    if (job.matchScore) {
        const scoreBadge = document.getElementById('jobScoreBadge');
        scoreBadge.textContent = `${job.matchScore}% match`;
        if (job.matchScore >= 80) {
            scoreBadge.className = 'px-3 py-1 rounded-full text-xs font-semibold border bg-green-100 text-green-800 border-green-300';
        } else if (job.matchScore >= 60) {
            scoreBadge.className = 'px-3 py-1 rounded-full text-xs font-semibold border bg-blue-100 text-blue-800 border-blue-300';
        } else {
            scoreBadge.className = 'px-3 py-1 rounded-full text-xs font-semibold border bg-yellow-100 text-yellow-800 border-yellow-300';
        }
    }

    // Requirements
    const reqList = document.getElementById('jobRequirements');
    reqList.innerHTML = job.requirements.map(req => `
        <li class="flex items-start gap-2">
            <i data-lucide="circle-check" class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"></i>
            ${req}
        </li>
    `).join('');

    // Skills
    const skillsDiv = document.getElementById('jobSkills');
    skillsDiv.innerHTML = job.skills.map(skill => `
        <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">${skill}</span>
    `).join('');

    // Study level
    document.getElementById('jobStudyLevel').textContent = Array.isArray(job.studyLevel) ? job.studyLevel.join(', ') : job.studyLevel;

    setTimeout(() => lucide.createIcons(), 10);
}

function applyToJob() {
    const user = sessionStorage.getItem('jobstudent_user');
    if (!user) {
        alert('Vous devez être connecté pour postuler');
        window.location.href = 'connexion.html';
        return;
    }
    alert('Candidature envoyée avec succès !');
}

function saveJob() {
    const btn = event.currentTarget;
    btn.classList.toggle('bg-blue-50');
    btn.classList.toggle('text-blue-700');
    if (btn.classList.contains('bg-blue-50')) {
        btn.innerHTML = '<i data-lucide="bookmark" class="w-5 h-5 fill-current"></i> Sauvegardé';
    } else {
        btn.innerHTML = '<i data-lucide="bookmark" class="w-5 h-5"></i> Sauvegarder';
    }
    setTimeout(() => lucide.createIcons(), 10);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();

    // Get job from URL or use default
    const jobId = getJobId();
    const job = getJobData();
    displayJob(job);
});
