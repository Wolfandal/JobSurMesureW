// Recherche Page JavaScript

// Mock jobs data
const mockJobs = [
    {
        id: '1',
        title: 'Développeur Full Stack Junior',
        company: 'TechStartup Paris',
        companyLogo: 'https://ui-avatars.com/api/?name=TS&background=3b82f6&color=fff',
        location: 'Paris, France',
        type: 'alternance',
        domain: 'Tech & IT',
        description: 'Rejoignez une startup en pleine croissance pour développer des applications web innovantes.',
        requirements: ['Formation en informatique (Bac+3 à Bac+5)', 'Connaissance de JavaScript/TypeScript'],
        skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Git'],
        studyLevel: ['bac+3', 'bac+4', 'bac+5'],
        duration: '12 mois',
        salary: '1 200€ - 1 500€/mois',
        startDate: '2026-03-01',
        postedAt: new Date('2026-01-25'),
        remote: true,
        matchScore: 92
    },
    {
        id: '2',
        title: 'Stage Marketing Digital',
        company: 'L\'Oréal',
        companyLogo: 'https://ui-avatars.com/api/?name=LO&background=e11d48&color=fff',
        location: 'Clichy, France',
        type: 'stage',
        domain: 'Marketing',
        description: 'Intégrez l\'équipe marketing digital d\'une marque leader mondiale.',
        requirements: ['Formation en marketing ou communication', 'Créativité et sensibilité digitale'],
        skills: ['Social Media', 'Google Analytics', 'SEO', 'Content Marketing', 'Canva'],
        studyLevel: ['bac+4', 'bac+5'],
        duration: '6 mois',
        salary: '1 000€/mois',
        startDate: '2026-04-01',
        postedAt: new Date('2026-01-20'),
        remote: false,
        matchScore: 78
    },
    {
        id: '3',
        title: 'Data Analyst Junior',
        company: 'BNP Paribas',
        companyLogo: 'https://ui-avatars.com/api/?name=BNP&background=00965e&color=fff',
        location: 'La Défense, France',
        type: 'alternance',
        domain: 'Data Science',
        description: 'Rejoignez l\'équipe Data Analytics d\'une banque de premier plan.',
        requirements: ['Formation en Data Science, Statistiques ou École d\'ingénieur'],
        skills: ['Python', 'SQL', 'Power BI', 'Tableau', 'Excel', 'Machine Learning'],
        studyLevel: ['bac+4', 'bac+5'],
        duration: '24 mois',
        salary: '1 400€ - 1 800€/mois',
        startDate: '2026-09-01',
        postedAt: new Date('2026-01-28'),
        remote: true,
        matchScore: 85
    },
    {
        id: '4',
        title: 'Stage Assistant Chef de Projet',
        company: 'Capgemini',
        companyLogo: 'https://ui-avatars.com/api/?name=CG&background=0070ad&color=fff',
        location: 'Lyon, France',
        type: 'stage',
        domain: 'Consulting',
        description: 'Participez à des projets de transformation digitale pour des clients grands comptes.',
        requirements: ['Formation en école de commerce ou d\'ingénieur'],
        skills: ['Gestion de projet', 'PowerPoint', 'Excel', 'Agile', 'Communication'],
        studyLevel: ['bac+4', 'bac+5'],
        duration: '6 mois',
        salary: '1 100€/mois',
        startDate: '2026-03-15',
        postedAt: new Date('2026-01-22'),
        remote: false,
        matchScore: 71
    },
    {
        id: '5',
        title: 'Développeur Mobile iOS/Android',
        company: 'Doctolib',
        companyLogo: 'https://ui-avatars.com/api/?name=DO&background=6366f1&color=fff',
        location: 'Paris, France',
        type: 'alternance',
        domain: 'Tech & IT',
        description: 'Développez les applications mobiles qui transforment le secteur de la santé.',
        requirements: ['Formation en développement mobile'],
        skills: ['Swift', 'Kotlin', 'React Native', 'Flutter', 'Firebase', 'REST API'],
        studyLevel: ['bac+3', 'bac+4', 'bac+5'],
        duration: '12 mois',
        salary: '1 300€ - 1 600€/mois',
        startDate: '2026-09-01',
        postedAt: new Date('2026-01-26'),
        remote: true,
        matchScore: 88
    },
    {
        id: '6',
        title: 'Stage Ressources Humaines',
        company: 'Decathlon',
        companyLogo: 'https://ui-avatars.com/api/?name=DE&background=0082c3&color=fff',
        location: 'Lille, France',
        type: 'stage',
        domain: 'Ressources Humaines',
        description: 'Découvrez les métiers RH au sein d\'un leader du sport.',
        requirements: ['Formation en RH, Psychologie ou École de commerce'],
        skills: ['Recrutement', 'Communication', 'Excel', 'Gestion administrative', 'Organisation'],
        studyLevel: ['bac+3', 'bac+4', 'bac+5'],
        duration: '4 mois',
        salary: '800€/mois',
        startDate: '2026-05-01',
        postedAt: new Date('2026-01-24'),
        remote: false,
        matchScore: 65
    },
    {
        id: '7',
        title: 'Ingénieur DevOps Junior',
        company: 'OVHcloud',
        companyLogo: 'https://ui-avatars.com/api/?name=OVH&background=000e9c&color=fff',
        location: 'Roubaix, France',
        type: 'alternance',
        domain: 'Tech & IT',
        description: 'Rejoignez le leader européen du cloud computing.',
        requirements: ['Formation en informatique/systèmes'],
        skills: ['Docker', 'Kubernetes', 'Linux', 'CI/CD', 'Python', 'Terraform', 'AWS'],
        studyLevel: ['bac+4', 'bac+5'],
        duration: '24 mois',
        salary: '1 500€ - 1 800€/mois',
        startDate: '2026-09-01',
        postedAt: new Date('2026-01-27'),
        remote: true,
        matchScore: 79
    },
    {
        id: '8',
        title: 'Stage Design UX/UI',
        company: 'BlaBlaCar',
        companyLogo: 'https://ui-avatars.com/api/?name=BB&background=00aff5&color=fff',
        location: 'Paris, France',
        type: 'stage',
        domain: 'Design',
        description: 'Créez des expériences utilisateur pour des millions de voyageurs.',
        requirements: ['Formation en design digital'],
        skills: ['Figma', 'Adobe XD', 'Prototypage', 'User Research', 'Design System'],
        studyLevel: ['bac+3', 'bac+4', 'bac+5'],
        duration: '6 mois',
        salary: '1 000€/mois',
        startDate: '2026-04-01',
        postedAt: new Date('2026-01-23'),
        remote: true,
        matchScore: 73
    }
];

function getScoreClass(score) {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 60) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
}

function getScoreText(score) {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Bon';
    if (score >= 40) return 'Moyen';
    return 'Faible';
}

function formatDate(date) {
    if (!date) return 'Date inconnue';
    return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function displayJobs(jobs) {
    const grid = document.getElementById('jobsGrid');
    const count = document.getElementById('resultsCount');

    if (jobs.length === 0) {
        grid.innerHTML = `
            <div class="text-center py-12">
                <div class="text-6xl mb-4">🔍</div>
                <h3 class="text-xl font-semibold text-gray-900 mb-2">Aucune offre trouvée</h3>
                <p class="text-gray-600">Essayez avec d'autres mots-clés ou filtres</p>
                <button onclick="searchJobs()" class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">Réinitialiser les filtres</button>
            </div>`;
        return;
    }

    count.textContent = `${jobs.length} offre${jobs.length > 1 ? 's' : ''} trouvée${jobs.length > 1 ? 's' : ''}`;

    let html = '';
    jobs.forEach(job => {
        html += `
        <div class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group">
            <div class="flex flex-col md:flex-row gap-4">
                <img src="${job.companyLogo}" alt="${job.company}" class="w-16 h-16 rounded-xl object-cover flex-shrink-0">
                <div class="flex-1">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <h3 class="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">${job.title}</h3>
                            <p class="text-gray-600">${job.company}</p>
                        </div>
                        ${job.matchScore ? `<div class="px-3 py-1 rounded-full text-xs font-semibold border ${getScoreClass(job.matchScore)}">${job.matchScore}% ${getScoreText(job.matchScore)}</div>` : ''}
                    </div>
                    <div class="flex flex-wrap gap-2 mb-3">
                        <span class="px-3 py-1 rounded-full text-xs font-medium ${job.type === 'stage' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}">
                            ${job.type === 'stage' ? '🎓 Stage' : '💼 Alternance'}
                        </span>
                        <span class="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">${job.domain}</span>
                        ${job.remote ? '<span class="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1"><i data-lucide="laptop" class="w-3 h-3"></i> Télétravail</span>' : ''}
                    </div>
                    <p class="text-gray-600 text-sm mb-3 line-clamp-2">${job.description}</p>
                    <div class="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                        <span class="flex items-center gap-1"><i data-lucide="map-pin" class="w-4 h-4"></i>${job.location}</span>
                        <span class="flex items-center gap-1"><i data-lucide="clock" class="w-4 h-4"></i>${job.duration}</span>
                        ${job.salary ? `<span class="flex items-center gap-1"><i data-lucide="dollar-sign" class="w-4 h-4"></i>${job.salary}</span>` : ''}
                    </div>
                    <div class="flex flex-wrap gap-1 mb-3">
                        ${job.skills.slice(0, 4).map(skill => `<span class="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">${skill}</span>`).join('')}
                        ${job.skills.length > 4 ? `<span class="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">+${job.skills.length - 4}</span>` : ''}
                    </div>
                    <div class="flex justify-between items-center pt-3 border-t border-gray-100">
                        <span class="text-xs text-gray-500">Publié le ${formatDate(job.postedAt)}</span>
                        <a href="offre.html?id=${job.id}" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Voir l'offre</a>
                    </div>
                </div>
            </div>
        </div>`;
    });

    grid.innerHTML = html;
    setTimeout(() => lucide.createIcons(), 10);
}

function searchJobs() {
    const query = document.getElementById('searchQuery').value.toLowerCase();
    const location = document.getElementById('location').value.toLowerCase();
    const type = document.getElementById('btnTypeAll').classList.contains('bg-blue-100') ? 'all' :
                 document.getElementById('btnTypeStage').classList.contains('bg-blue-100') ? 'stage' : 'alternance';
    const studyLevel = document.getElementById('studyLevel').value;
    const domain = document.getElementById('domain').value;
    const remoteOnly = document.getElementById('remoteOnly').checked;

    let filtered = [...mockJobs];

    if (query) {
        filtered = filtered.filter(job =>
            job.title.toLowerCase().includes(query) ||
            job.company.toLowerCase().includes(query) ||
            job.skills.some(skill => skill.toLowerCase().includes(query))
        );
    }

    if (location) {
        filtered = filtered.filter(job => job.location.toLowerCase().includes(location));
    }

    if (type !== 'all') {
        filtered = filtered.filter(job => job.type === type);
    }

    if (studyLevel) {
        filtered = filtered.filter(job => {
            const levels = Array.isArray(job.studyLevel) ? job.studyLevel : [job.studyLevel];
            return levels.some(l => l.toLowerCase().includes(studyLevel.toLowerCase()));
        });
    }

    if (domain) {
        filtered = filtered.filter(job => job.domain === domain);
    }

    if (remoteOnly) {
        filtered = filtered.filter(job => job.remote === true);
    }

    // Sort by score
    filtered.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    displayJobs(filtered);
}

function filterByType(type) {
    const btns = ['btnTypeAll', 'btnTypeStage', 'btnTypeAlternance'];
    btns.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.className = id === 'btnTypeAll' ? 'px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium' :
                            id === 'btnTypeStage' ? 'px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium' :
                            'px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium';
        }
    });

    const activeBtn = type === 'all' ? 'btnTypeAll' : type === 'stage' ? 'btnTypeStage' : 'btnTypeAlternance';
    const activeBtnEl = document.getElementById(activeBtn);
    if (activeBtnEl) {
        activeBtnEl.classList.remove('bg-gray-100', 'text-gray-600');
        activeBtnEl.classList.add(type === 'all' ? 'bg-blue-100 text-blue-700' :
                               type === 'stage' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700');
    }

    // Reset other buttons
    btns.forEach(id => {
        if (id !== activeBtn) {
            const btn = document.getElementById(id);
            if (btn) {
                btn.className = id === 'btnTypeAll' ? 'px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium' :
                                id === 'btnTypeStage' ? 'px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium' :
                                'px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium';
            }
        }
    });

    searchJobs();
}

function initMobileMenu() {
    // Mobile menu logic would go here
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();
    initMobileMenu();
    displayJobs(mockJobs);
});
