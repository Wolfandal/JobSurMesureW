// Preparation Entretien Page JavaScript

// Mock QCM data - adaptée pour Développeur Full Stack
const qcmData = [
    {
        id: 1,
        question: "Comment présenteriez-vous votre projet de fin d'études ?",
        options: [
            "Je décris uniquement les technologies utilisées",
            "Je parle de la situation, de ma mission, des actions et des résultats",
            "Je raconte une anecdote sur mon équipe",
            "Je lis mon rapport mot à mot"
        ],
        correctAnswer: 1,
        explanation: "Utilisez la méthode STAR : Situation, Task, Action, Result pour structurer votre réponse"
    },
    {
        id: 2,
        question: "Quelle est la meilleure réponse à 'Quelle est votre plus grande faiblesse' ?",
        options: [
            "Je n'ai aucune faiblesse",
            "Je travaille trop dur",
            "Je suis parfois trop perfectionniste et j'oublie de déléguer",
            "Je n'aime pas travailler en équipe"
        ],
        correctAnswer: 2,
        explanation: "Choisissez une faiblesse réelle mais qui ne compromet pas le poste, et montrez comment vous travaillez à l'améliorer"
    },
    {
        id: 3,
        question: "Pourquoi voulez-vous travailler chez TechStartup ?",
        options: [
            "Parce que vous cherchez un stage et vous n'avez pas eu d'autres propositions",
            "Parce que vous admirez l'innovation et la culture d'entreprise",
            "Parce que c'est proche de chez vous",
            "Parce que c'est une entreprise connue"
        ],
        correctAnswer: 1,
        explanation: "Montrez que vous avez étudié l'entreprise et que votre motivation est alignée avec ses valeurs"
    },
    {
        id: 4,
        question: "Où vous voyez-vous dans 5 ans ?",
        options: [
            "Chef de l'entreprise",
            "Toujours chez vous avec les mêmes compétences",
            "En train de développer mes compétences et d'apporter de la valeur à l'équipe",
            "À la plage, pas au boulot"
        ],
        correctAnswer: 2,
        explanation: "Montrez de l'ambition professionnelle avec une trajectoire de croissance"
    },
    {
        id: 5,
        question: "Comment gérez-vous un conflit avec un collègue ?",
        options: [
            "Je m'isole jusqu'à ce que ça passe",
            "Je discute calmement pour comprendre son point de vue",
            "Je vais directement voir le manager",
            "Je le contredis violemment pour avoir raison"
        ],
        correctAnswer: 1,
        explanation: "La communication calme et l'écoute sont les clés de la résolution de conflits"
    }
];

// QCM données alternatives pour un autre type de poste (ex: Marketing)
const qcmDataMarketing = [
    {
        id: 1,
        question: "Comment mesurez-vous le succès d'une campagne marketing ?",
        options: [
            "Au nombre de publications",
            "À l'engagement et au ROI",
            "Au nombre de likes",
            "À la créativité des contenus"
        ],
        correctAnswer: 1,
        explanation: "Les indicateurs clés de performance (KPI) comme l'engagement et le ROI sont les plus pertinents"
    },
    {
        id: 2,
        question: "Quel outil utilisez-vous principalement pour l'analyse de données ?",
        options: [
            "Photoshop",
            "Google Analytics",
            "InDesign",
            "Premier Pro"
        ],
        correctAnswer: 1,
        explanation: "Google Analytics est l'outil standard pour l'analyse web et le suivi des campagnes"
    },
    {
        id: 3,
        question: "Qu'est-ce qu'un buyer persona ?",
        options: [
            "Un client idéal type",
            "Un outil de gestion de社群",
            "Une stratégie de pricing",
            "Un type de contenu vidéo"
        ],
        correctAnswer: 0,
        explanation: "Un buyer persona représente le profil type de votre client idéal"
    }
];

// QCM données alternatives pour un type de poste (ex: Data)
const qcmDataData = [
    {
        id: 1,
        question: "Quelle méthode utilisez-vous pour traiter les valeurs manquantes ?",
        options: [
            "Les supprimer systématiquement",
            "Les remplacer par 0",
            "Les imputer ou supprimer selon le contexte",
            "Les ignorer"
        ],
        correctAnswer: 2,
        explanation: "Le choix dépend du pourcentage de valeurs manquantes et du contexte des données"
    },
    {
        id: 2,
        question: "Quelle est la différence entre R² et Adjusted R² ?",
        options: [
            "R² est toujours plus précis",
            "Adjusted R² pénalise le nombre de variables",
            "Ils sont identiques",
            "Adjusted R² n'existe pas"
        ],
        correctAnswer: 1,
        explanation: "Adjusted R² prend en compte le nombre de variables pour éviter le surajustement"
    },
    {
        id: 3,
        question: "Quand utiliser un arbre de décision ?",
        options: [
            "Uniquement pour la classification",
            "Pour la régression et la classification",
            "Uniquement pour les données textuelles",
            "Jamais avec des données numériques"
        ],
        correctAnswer: 1,
        explanation: "Les arbres de décision peuvent être utilisés pour la classification et la régression"
    }
];

function displayQCM() {
    const container = document.getElementById('qcmContainer');
    let html = '';

    qcmData.forEach((item, index) => {
        html += `
        <div class="border-b border-gray-100 pb-4">
            <p class="font-medium text-gray-900 mb-3">${index + 1}. ${item.question}</p>
            <div class="space-y-2">
                ${item.options.map((option, optIndex) => `
                    <label class="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors">
                        <input type="radio" name="q${item.id}" value="${optIndex}" class="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300">
                        <span class="text-sm text-gray-700">${option}</span>
                    </label>
                `).join('')}
            </div>
        </div>`;
    });

    container.innerHTML = html;
    setTimeout(() => lucide.createIcons(), 10);
}

function submitQCM() {
    let score = 0;
    let total = qcmData.length;

    qcmData.forEach(item => {
        const selected = document.querySelector(`input[name="q${item.id}"]:checked`);
        if (selected && parseInt(selected.value) === item.correctAnswer) {
            score++;
        }
    });

    const percentage = Math.round((score / total) * 100);
    const resultDiv = document.getElementById('qcmResult');
    const scoreText = document.getElementById('qcmScore');

    scoreText.innerHTML = `
        Vous avez obtenu <strong>${score}</strong> bonnes réponses sur <strong>${total}</strong>.
        <br><span class="${percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-blue-600' : 'text-yellow-600'}">
            Score : ${percentage}%
        </span>
    `;

    resultDiv.classList.remove('hidden');
}

function resetQCM() {
    const radios = document.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => radio.checked = false);

    document.getElementById('qcmResult').classList.add('hidden');
}

function showQCM() {
    const section = document.getElementById('qcmSection');
    const introText = document.getElementById('qcmIntroText');
    const btn = document.getElementById('showQCMBtn');

    if (section && btn && introText) {
        section.classList.remove('hidden');
        btn.classList.add('hidden');
        introText.textContent = "Quiz en cours - Répondez aux questions ci-dessous.";
        // Re-display QCM if section was already shown but answers reset
        displayQCM();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();

    const showBtn = document.getElementById('showQCMBtn');
    if (showBtn) {
        showBtn.addEventListener('click', showQCM);
    }
});
