// Masque/renvoie tous les onglets et active celui demandé
function switchTab(tab) {
    document.getElementById('login-tab').style.display = 'none';
    document.getElementById('register-tab').style.display = 'none';
    document.getElementById('generator-tab').style.display = 'none';

    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    if (tab === 'login') {
        document.getElementById('login-tab').style.display = 'block';
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
    } else if (tab === 'register') {
        document.getElementById('register-tab').style.display = 'block';
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
    } else if (tab === 'generator') {
        document.getElementById('generator-tab').style.display = 'block';
        document.querySelectorAll('.tab-btn')[2].classList.add('active');
    }
}

// Alterne la visibilité du mot de passe (texte/masqué)
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
}

// Gère la soumission du formulaire de connexion
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include' // Inclure les cookies de session
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('login-message', data.message, 'success');
            setTimeout(() => window.location.href = '/index.html', 1500);
        } else {
            showMessage('login-message', data.error, 'error');
        }
    } catch (error) {
        showMessage('login-message', 'Erreur de connexion', 'error');
    }
}

// Gère la soumission du formulaire d'inscription
async function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;

    if (password !== confirm) {
        showMessage('register-message', 'Les mots de passe ne correspondent pas', 'error');
        return;
    }

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
            credentials: 'include' // Inclure les cookies de session
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('register-message', data.message, 'success');
            setTimeout(() => window.location.href = '/index.html', 1500);
        } else {
            showMessage('register-message', data.error, 'error');
        }
    } catch (error) {
        showMessage('register-message', 'Erreur lors de l\'inscription', 'error');
    }
}

// Affiche un message d'alerte dans un élément spécifique
function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = `message ${type}`;
}

// Écouteur pour vérifier la force du mot de passe pendant la saisie
document.getElementById('register-password').addEventListener('input', (e) => {
    const password = e.target.value;
    const strength = calculateStrength(password);
    const strengthEl = document.getElementById('password-strength');

    const strengthLevels = ['Très faible', 'Faible', 'Faible à moyen', 'Moyen', 'Moyen à fort', 'Fort', 'Très fort'];
    const strengthClass = strength < 2 ? 'strength-weak' : strength < 4 ? 'strength-medium' : 'strength-strong';

    strengthEl.className = `password-strength ${strengthClass}`;
    strengthEl.textContent = `Force: ${strengthLevels[strength]}`;
});

// Calcule la force d'un mot de passe (score de 0 à 6)
function calculateStrength(password) {
    let score = 0;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*]/.test(password)) score++;
    return score;
}

// Génère un mot de passe via l'API serveur
async function generatePassword() {
    const length = parseInt(document.getElementById('password-length').value) || 16;

    try {
        const response = await fetch('/api/auth/generate-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ length }),
            credentials: 'include' // Inclure les cookies de session
        });

        const data = await response.json();
        document.getElementById('generated-password').value = data.password;

        const strengthEl = document.getElementById('generator-strength');
        const strengthClass = data.strength < 2 ? 'strength-weak' : data.strength < 4 ? 'strength-medium' : 'strength-strong';
        strengthEl.className = `password-strength ${strengthClass}`;
        strengthEl.textContent = `Force: ${data.feedback}`;
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// Copie le mot de passe généré dans le presse-papiers
function copyToClipboard() {
    const password = document.getElementById('generated-password').value;
    if (password) {
        navigator.clipboard.writeText(password);
        alert('Mot de passe copié dans le presse-papiers!');
    }
}

// Génère un email aléatoire basé sur le domaine choisi
function generateEmail() {
    const domain = document.getElementById('email-domain').value;
    const adjectives = ['swift', 'bright', 'smart', 'quick', 'happy', 'lucky', 'cool', 'bold', 'keen', 'warm'];
    const nouns = ['fox', 'bird', 'wolf', 'eagle', 'lion', 'tiger', 'panda', 'bear', 'otter', 'whale'];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 9999);
    const email = `${adjective}${noun}${number}${domain}`;
    document.getElementById('generated-email').value = email;
}

// Copie l'email généré dans le presse-papiers
function copyEmailToClipboard() {
    const email = document.getElementById('generated-email').value;
    if (email) {
        navigator.clipboard.writeText(email);
        alert('Email copié dans le presse-papiers!');
    }
}

// Active/désactive le mode sombre
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// Applique le mode sombre au chargement si sauvegardé
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
}

// Génère les valeurs initiales au chargement de la page
generateEmail();
generatePassword();
