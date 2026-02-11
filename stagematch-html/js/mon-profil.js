// Mon Profil Page JavaScript - JobSurMesure

const API_URL = 'http://localhost:3000/api';
let currentUser = null;

// File storage keys - will be set when user is loaded
let cvFileKey = '';
let lmFileKey = '';

// Get current user from session
function getCurrentUser() {
    const user = sessionStorage.getItem('jobsurmesure_user');
    if (user) {
        const parsedUser = JSON.parse(user);
        // Initialize file keys based on user ID
        cvFileKey = `cv_${parsedUser.id}`;
        lmFileKey = `lm_${parsedUser.id}`;
        return parsedUser;
    }
    return null;
}

// Load user profile from API
async function loadUserProfile() {
    currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'connexion.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/users/${currentUser.id}`);
        const data = await response.json();
        console.log('API Response:', data);

        if (data.success) {
            const user = data.user;
            // Restore files from localStorage if not in server response
            if (!user.profile?.cvUrl || !user.profile?.coverLetterUrl) {
                console.log('Files not in server response, checking localStorage...');
                const savedFiles = JSON.parse(localStorage.getItem('jobsurmesure_files') || '{}');
                console.log('Saved files:', savedFiles);
                console.log('cvFileKey:', cvFileKey);
                if (savedFiles[cvFileKey] && !user.profile.cvUrl) {
                    user.profile.cvUrl = savedFiles[cvFileKey].url;
                    user.profile.cvName = savedFiles[cvFileKey].name;
                    console.log('CV restored from localStorage');
                }
                if (savedFiles[lmFileKey] && !user.profile.coverLetterUrl) {
                    user.profile.coverLetterUrl = savedFiles[lmFileKey].url;
                    user.profile.lmName = savedFiles[lmFileKey].name;
                    console.log('LM restored from localStorage');
                }
            }
            displayUserProfile(user);
        } else {
            console.log('API returned success: false, using session data');
            // Fallback to session data
            displayUserProfile(currentUser);
        }
    } catch (err) {
        console.error('Error loading profile:', err);
        // Fallback to session data and localStorage
        const savedFiles = JSON.parse(localStorage.getItem('jobsurmesure_files') || '{}');
        if (savedFiles[cvFileKey]) {
            currentUser.profile = currentUser.profile || {};
            currentUser.profile.cvUrl = savedFiles[cvFileKey].url;
            currentUser.profile.cvName = savedFiles[cvFileKey].name;
        }
        if (savedFiles[lmFileKey]) {
            currentUser.profile = currentUser.profile || {};
            currentUser.profile.coverLetterUrl = savedFiles[lmFileKey].url;
            currentUser.profile.lmName = savedFiles[lmFileKey].name;
        }
        displayUserProfile(currentUser);
    }
}

// Display user profile
function displayUserProfile(user) {
    // Profile header
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');

    if (userAvatar) userAvatar.textContent = `${user.firstName[0]}${user.lastName[0]}`;
    if (userName) userName.textContent = `${user.firstName} ${user.lastName}`;
    if (userEmail) userEmail.textContent = user.email;

    // Personal info form
    const firstNameInput = document.getElementById('firstNameInput');
    const lastNameInput = document.getElementById('lastNameInput');
    const emailInput = document.getElementById('emailInput');
    const dateOfBirthInput = document.getElementById('dateOfBirthInput');

    if (firstNameInput) firstNameInput.value = user.firstName || '';
    if (lastNameInput) lastNameInput.value = user.lastName || '';
    if (emailInput) emailInput.value = user.email || '';
    if (dateOfBirthInput) dateOfBirthInput.value = user.dateOfBirth || '';

    // User profile form
    const schoolInput = document.getElementById('schoolInput');
    const studyLevelInput = document.getElementById('studyLevelInput');
    const locationInput = document.getElementById('locationInput');

    if (schoolInput) schoolInput.value = user.profile?.school || '';
    if (studyLevelInput) studyLevelInput.value = user.profile?.studyLevel || 'bac+3';
    if (locationInput) locationInput.value = user.profile?.location || '';

    // Skills input (comma separated)
    const skillsInput = document.getElementById('skillsInput');
    const skills = Array.isArray(user.profile?.skills) ? user.profile.skills.join(', ') : '';
    if (skillsInput) skillsInput.value = skills;

    // Languages
    const languagesInput = document.getElementById('languagesInput');
    const languages = Array.isArray(user.profile?.languages) ? user.profile.languages.join(', ') : '';
    if (languagesInput) languagesInput.value = languages;

    // Preferred locations
    const preferredLocationsInput = document.getElementById('preferredLocationsInput');
    const preferredLocations = Array.isArray(user.profile?.preferredLocations) ? user.profile.preferredLocations.join(', ') : '';
    if (preferredLocationsInput) preferredLocationsInput.value = preferredLocations;

    // Preferred domains
    const preferredDomainsInput = document.getElementById('preferredDomainsInput');
    const preferredDomains = Array.isArray(user.profile?.preferredDomains) ? user.profile.preferredDomains.join(', ') : '';
    if (preferredDomainsInput) preferredDomainsInput.value = preferredDomains;

    // Preferred types
    const prefStage = document.getElementById('prefStage');
    const prefAlternance = document.getElementById('prefAlternance');

    if (prefStage && user.profile?.preferredTypes) {
        const types = user.profile.preferredTypes;
        if (types.includes('stage')) prefStage.checked = true;
        if (types.includes('alternance')) prefAlternance.checked = true;
    }

    // CV and LM files
    const cvFileNameEl = document.getElementById('cvFileName');
    const cvFileStatusEl = document.getElementById('cvFileStatus');
    const cvFileContainer = document.getElementById('cvFileContainer');
    const cvPlaceholder = document.getElementById('cvPlaceholder');

    if (user.profile?.cvUrl) {
        if (cvFileNameEl) cvFileNameEl.textContent = user.profile.cvName || 'CV_uploadé.pdf';
        if (cvFileStatusEl) {
            cvFileStatusEl.classList.remove('text-gray-500');
            cvFileStatusEl.classList.add('text-green-600');
            cvFileStatusEl.textContent = 'Uploadé le ' + new Date().toLocaleDateString('fr-FR');
        }
        if (cvFileContainer) cvFileContainer.classList.remove('hidden');
        if (cvPlaceholder) cvPlaceholder.classList.add('hidden');
    }

    const lmFileNameEl = document.getElementById('lmFileName');
    const lmFileStatusEl = document.getElementById('lmFileStatus');
    const lmFileContainer = document.getElementById('lmFileContainer');
    const lmPlaceholder = document.getElementById('lmPlaceholder');

    if (user.profile?.coverLetterUrl) {
        if (lmFileNameEl) lmFileNameEl.textContent = user.profile.lmName || 'LM_uploadée.pdf';
        if (lmFileStatusEl) {
            lmFileStatusEl.classList.remove('text-gray-500');
            lmFileStatusEl.classList.add('text-green-600');
            lmFileStatusEl.textContent = 'Uploadée le ' + new Date().toLocaleDateString('fr-FR');
        }
        if (lmFileContainer) lmFileContainer.classList.remove('hidden');
        if (lmPlaceholder) lmPlaceholder.classList.add('hidden');
    }

    setTimeout(() => lucide.createIcons(), 10);
}

// Preview CV
function previewCv() {
    const cvUrl = currentUser?.profile?.cvUrl;
    if (!cvUrl) {
        alert('Veuillez d\'abord uploader votre CV');
        return;
    }

    // Update modal title and filename
    const cvModalTitle = document.getElementById('cvModalTitle');
    const cvModalFilename = document.getElementById('cvModalFilename');
    const cvFileNameEl = document.getElementById('cvFileName');

    if (cvModalTitle) {
        cvModalTitle.textContent = `${currentUser.firstName} ${currentUser.lastName} - CV`;
    }
    if (cvModalFilename && cvFileNameEl) {
        cvModalFilename.textContent = cvFileNameEl.textContent;
    }

    document.getElementById('cvPreviewFrame').src = cvUrl;
    document.getElementById('cvModal').classList.remove('hidden');
}

// Close CV modal
function closeCvModal() {
    document.getElementById('cvModal').classList.add('hidden');
    document.getElementById('cvPreviewFrame').src = '';
}

// Save profile
async function saveProfile() {
    if (!currentUser) {
        alert('Veuillez vous connecter');
        return;
    }

    const submitBtn = document.getElementById('saveProfileBtn');
    if (!submitBtn) {
        alert('Erreur: bouton de sauvegarde non trouvé');
        return;
    }

    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sauvegarde...';
    submitBtn.disabled = true;

    try {
        // Get profile fields that exist in the form
        const studyLevel = document.getElementById('studyLevelInput') ? document.getElementById('studyLevelInput').value : 'bac+3';
        const location = document.getElementById('locationInput') ? document.getElementById('locationInput').value.trim() : '';
        const skillsInput = document.getElementById('skillsInput');
        const languagesInput = document.getElementById('languagesInput');
        const preferredLocationsInput = document.getElementById('preferredLocationsInput');
        const preferredDomainsInput = document.getElementById('preferredDomainsInput');
        const prefStage = document.getElementById('prefStage');
        const prefAlternance = document.getElementById('prefAlternance');

        // Add school if field exists
        const school = document.getElementById('schoolInput') ? document.getElementById('schoolInput').value.trim() : '';

        const profile = {
            school: school,
            studyLevel: studyLevel,
            location: location,
            skills: skillsInput ? skillsInput.value.split(',').map(s => s.trim()).filter(s => s) : [],
            languages: languagesInput ? languagesInput.value.split(',').map(l => l.trim()).filter(l => l) : [],
            preferredLocations: preferredLocationsInput ? preferredLocationsInput.value.split(',').map(l => l.trim()).filter(l => l) : [],
            preferredDomains: preferredDomainsInput ? preferredDomainsInput.value.split(',').map(d => d.trim()).filter(d => d) : [],
            preferredTypes: []
        };

        if (prefStage && prefStage.checked) profile.preferredTypes.push('stage');
        if (prefAlternance && prefAlternance.checked) profile.preferredTypes.push('alternance');

        console.log('Saving profile:', profile);

        const response = await fetch(`${API_URL}/users/${currentUser.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profile })
        });

        console.log('Response status:', response.status);

        if (response.ok) {
            alert('Profil sauvegardé avec succès !');
            // Update current user
            currentUser.profile = profile;
            sessionStorage.setItem('jobsurmesure_user', JSON.stringify(currentUser));

            // Save files to localStorage for persistence
            const savedFiles = JSON.parse(localStorage.getItem('jobsurmesure_files') || '{}');
            if (currentUser.profile.cvUrl) {
                savedFiles[cvFileKey] = {
                    url: currentUser.profile.cvUrl,
                    name: currentUser.profile.cvName,
                    type: 'cv',
                    timestamp: new Date().toISOString()
                };
            }
            if (currentUser.profile.coverLetterUrl) {
                savedFiles[lmFileKey] = {
                    url: currentUser.profile.coverLetterUrl,
                    name: currentUser.profile.lmName,
                    type: 'lm',
                    timestamp: new Date().toISOString()
                };
            }
            localStorage.setItem('jobsurmesure_files', JSON.stringify(savedFiles));

            // Update display
            document.getElementById('userStudyLevel').textContent = `Étudiant en ${profile.studyLevel || 'Bac+3'}`;

            // Reload jobs with new match scores if on search page
            if (typeof searchJobs === 'function') {
                searchJobs();
            }
        } else {
            const errorData = await response.json().catch(() => ({}));
            console.error('Save failed:', errorData);
            alert(`Erreur lors de la sauvegarde: ${errorData.error || response.statusText}`);
        }
    } catch (err) {
        console.error('Error saving profile:', err);
        alert(`Erreur lors de la sauvegarde: ${err.message}`);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Upload CV file
async function uploadCv(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Load current user if not available
    if (!currentUser) {
        currentUser = getCurrentUser();
    }

    if (currentUser) {
        // In a real app, this would upload to a server
        const reader = new FileReader();
        reader.onload = async function(e) {
            // Store file as base64 in session storage (for immediate use)
            currentUser.profile = currentUser.profile || {};
            currentUser.profile.cvUrl = e.target.result;
            currentUser.profile.cvName = file.name;

            // Save to local storage for persistence across refreshes
            const savedFiles = JSON.parse(localStorage.getItem('jobsurmesure_files') || '{}');
            savedFiles[cvFileKey] = {
                url: e.target.result,
                name: file.name,
                type: 'cv',
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('jobsurmesure_files', JSON.stringify(savedFiles));

            // Save to server
            try {
                await fetch(`${API_URL}/users/${currentUser.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ profile: currentUser.profile })
                });
            } catch (err) {
                console.warn('Could not save to server:', err);
            }

            sessionStorage.setItem('jobsurmesure_user', JSON.stringify(currentUser));

            // Update UI
            const cvFileNameEl = document.getElementById('cvFileName');
            const cvFileStatusEl = document.getElementById('cvFileStatus');
            const cvFileContainer = document.getElementById('cvFileContainer');
            const cvPlaceholder = document.getElementById('cvPlaceholder');

            if (cvFileNameEl) {
                cvFileNameEl.textContent = file.name;
            }
            if (cvFileStatusEl) {
                cvFileStatusEl.classList.remove('text-gray-500', 'text-red-500');
                cvFileStatusEl.classList.add('text-green-600');
                cvFileStatusEl.textContent = 'Uploadé le ' + new Date().toLocaleDateString('fr-FR');
            }
            if (cvFileContainer) {
                cvFileContainer.classList.remove('hidden');
            }
            if (cvPlaceholder) {
                cvPlaceholder.classList.add('hidden');
            }
        };
        reader.readAsDataURL(file);
    } else {
        alert('Veuillez vous connecter pour uploader votre CV');
        window.location.href = 'connexion.html';
    }
}

// Upload LM file
async function uploadLm(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Load current user if not available
    if (!currentUser) {
        currentUser = getCurrentUser();
    }

    if (currentUser) {
        // In a real app, this would upload to a server
        const reader = new FileReader();
        reader.onload = async function(e) {
            // Store file as base64 in session storage (for immediate use)
            currentUser.profile = currentUser.profile || {};
            currentUser.profile.coverLetterUrl = e.target.result;
            currentUser.profile.lmName = file.name;

            // Save to local storage for persistence across refreshes
            const savedFiles = JSON.parse(localStorage.getItem('jobsurmesure_files') || '{}');
            savedFiles[lmFileKey] = {
                url: e.target.result,
                name: file.name,
                type: 'lm',
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('jobsurmesure_files', JSON.stringify(savedFiles));

            // Save to server
            try {
                await fetch(`${API_URL}/users/${currentUser.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ profile: currentUser.profile })
                });
            } catch (err) {
                console.warn('Could not save to server:', err);
            }

            sessionStorage.setItem('jobsurmesure_user', JSON.stringify(currentUser));

            // Update UI
            const lmFileNameEl = document.getElementById('lmFileName');
            const lmFileStatusEl = document.getElementById('lmFileStatus');
            const lmFileContainer = document.getElementById('lmFileContainer');
            const lmPlaceholder = document.getElementById('lmPlaceholder');

            if (lmFileNameEl) {
                lmFileNameEl.textContent = file.name;
            }
            if (lmFileStatusEl) {
                lmFileStatusEl.classList.remove('text-gray-500', 'text-red-500');
                lmFileStatusEl.classList.add('text-green-600');
                lmFileStatusEl.textContent = 'Uploadée le ' + new Date().toLocaleDateString('fr-FR');
            }
            if (lmFileContainer) {
                lmFileContainer.classList.remove('hidden');
            }
            if (lmPlaceholder) {
                lmPlaceholder.classList.add('hidden');
            }
        };
        reader.readAsDataURL(file);
    } else {
        alert('Veuillez vous connecter pour uploader votre lettre de motivation');
        window.location.href = 'connexion.html';
    }
}

// Logout function
function logout() {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
        sessionStorage.removeItem('jobsurmesure_user');
        window.location.href = 'index.html';
    }
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
    loadUserProfile();
});
