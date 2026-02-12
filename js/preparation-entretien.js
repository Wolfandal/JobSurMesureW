// Preparation Entretien Page JavaScript

// Mock QCM data
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

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();
    displayQCM();
});