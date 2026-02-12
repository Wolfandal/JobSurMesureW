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
    const wrongAnswers = [];

    qcmData.forEach(item => {
        const selected = document.querySelector(`input[name="q${item.id}"]:checked`);
        if (selected && parseInt(selected.value) === item.correctAnswer) {
            score++;
        } else if (selected) {
            wrongAnswers.push({ item: item, selectedOption: parseInt(selected.value) });
        }
    });

    const percentage = Math.round((score / total) * 100);
    const resultDiv = document.getElementById('qcmResult');
    const scoreText = document.getElementById('qcmScore');

    // Clear previous content
    resultDiv.innerHTML = '';

    // Build professional results section
    let resultHtml = `
        <div class="mb-6 p-6 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl text-white shadow-lg">
            <div class="flex items-center gap-4">
                <div class="flex-shrink-0">
                    <i data-lucide="trophy" class="w-16 h-16"></i>
                </div>
                <div>
                    <h4 class="text-lg font-semibold opacity-90">Résultat de votre quiz</h4>
                    <div class="text-4xl font-bold mt-1">${percentage}%</div>
                    <p class="opacity-80 text-sm mt-1">${score} bonnes réponses sur ${total}</p>
                </div>
            </div>
        </div>

        <div class="space-y-6">
            <h3 class="text-lg font-bold text-gray-900 border-b pb-2">Corrigé détaillé</h3>
    `;

    // Display each question with detailed feedback
    qcmData.forEach((item, index) => {
        const selected = document.querySelector(`input[name="q${item.id}"]:checked`);
        const isSelectedCorrect = selected && parseInt(selected.value) === item.correctAnswer;

        const isLast = index === qcmData.length - 1;

        if (isSelectedCorrect) {
            resultHtml += `
                <div class="bg-green-50 rounded-xl p-5 border border-green-200 shadow-sm">
                    <div class="flex items-start gap-4">
                        <div class="flex-shrink-0 mt-1">
                            <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                <i data-lucide="circle-check" class="w-6 h-6 text-green-700"></i>
                            </div>
                        </div>
                        <div class="flex-1">
                            <p class="font-semibold text-green-900 text-lg mb-2">Question ${index + 1} : ${item.question}</p>
                            <div class="pl-14">
                                <div class="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                                    Votre réponse : <span class="font-bold">${item.options[item.correctAnswer]}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            resultHtml += `
                <div class="bg-white rounded-xl p-5 border border-red-200 shadow-sm hover:shadow-md transition-shadow">
                    <div class="flex items-start gap-4">
                        <div class="flex-shrink-0 mt-1">
                            <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <i data-lucide="circle-x" class="w-6 h-6 text-red-700"></i>
                            </div>
                        </div>
                        <div class="flex-1">
                            <p class="font-semibold text-gray-900 text-lg mb-4">Question ${index + 1} : ${item.question}</p>

                            <div class="space-y-3">
                                <div class="bg-red-50 rounded-lg p-3 border border-red-100">
                                    <div class="flex items-start gap-2 text-sm">
                                        <i data-lucide="circle-alert" class="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5"></i>
                                        <span class="text-red-900"><strong>Votre réponse :</strong> ${item.options[selected.value]}</span>
                                    </div>
                                </div>

                                <div class="bg-green-50 rounded-lg p-3 border border-green-100">
                                    <div class="flex items-start gap-2 text-sm">
                                        <i data-lucide="check" class="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5"></i>
                                        <span class="text-green-900"><strong>Bonne réponse :</strong> ${item.options[item.correctAnswer]}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-100">
                                <div class="flex items-start gap-3">
                                    <i data-lucide="lightbulb" class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"></i>
                                    <div class="flex-1">
                                        <p class="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">Pourquoi ?</p>
                                        <p class="text-sm text-gray-800 leading-relaxed">${item.explanation}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    });

    resultHtml += `
        </div>

        <div class="mt-8 p-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white text-center">
            <h4 class="text-lg font-semibold mb-2">Pour aller plus loin</h4>
            <p class="opacity-90 text-sm mb-4">Retournez sur votre profil pour ajouter des compétences ou modifier votre CV afin d'améliorer vos chances.</p>
            <a href="mon-profil.html" class="inline-flex items-center gap-2 bg-white text-purple-700 px-6 py-2 rounded-lg font-semibold hover:bg-purple-50 transition-colors">
                <i data-lucide="file-text" class="w-4 h-4"></i>
                Mon CV
            </a>
        </div>
    `;

    resultDiv.innerHTML = resultHtml;
    resultDiv.classList.remove('hidden');
    document.getElementById('qcmResetContainer').classList.remove('hidden');

    // Re-init icons after dynamic content
    setTimeout(() => lucide.createIcons(), 50);
}

function resetQCM() {
    const radios = document.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => radio.checked = false);

    document.getElementById('qcmResult').classList.add('hidden');
    document.getElementById('qcmResult').innerHTML = '';
    document.getElementById('qcmResetContainer').classList.add('hidden');
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();
    displayQCM();
});