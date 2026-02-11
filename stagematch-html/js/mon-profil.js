// Mon Profil Page JavaScript

let currentCvData = null;
let currentCvType = null;

// Logout function
function logout() {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
        sessionStorage.removeItem('jobstudent_user');
        window.location.href = 'connexion.html';
    }
}

// Preview CV
function previewCv() {
    // In a real app, this would load actual CV data
    currentCvData = 'data:application/pdf;base64,JVBERi0xLjUKJcOkw7zDtsO0';
    currentCvType = 'application/pdf';

    document.getElementById('cvPreviewFrame').src = currentCvData;
    document.getElementById('cvModal').classList.remove('hidden');
}

// Close CV modal
function closeCvModal() {
    document.getElementById('cvModal').classList.add('hidden');
    document.getElementById('cvPreviewFrame').src = '';
}

// Save profile
function saveProfile() {
    alert('Profil sauvegardé avec succès !');
}

// Mobile menu
function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const menu = document.getElementById('mobileMenu');
    const icon = document.getElementById('mobileMenuIcon');

    if (btn && menu && icon) {
        btn.addEventListener('click', function() {
            menu.classList.toggle('hidden');
            if (menu.classList.contains('hidden')) {
                icon.setAttribute('data-lucide', 'menu');
            } else {
                icon.setAttribute('data-lucide', 'x');
            }
            setTimeout(() => lucide.createIcons(), 10);
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();
    initMobileMenu();
});
