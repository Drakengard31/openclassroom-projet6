// Vérifie l'état de connexion et met à jour l'interface
document.addEventListener('DOMContentLoaded', function() {
    updateUIForAuthState();
});

// Fonction principale pour gérer l'état de l'UI
function updateUIForAuthState() {
    const isLoggedIn = !!localStorage.getItem('authToken');
    const editButton = document.querySelector('.edit-button');
    const filters = document.querySelector('.category-filters');
    const loginLink = document.querySelector('nav a[href="login.html"]');

    // Gestion du bouton Modifier
    if (editButton) {
        editButton.style.display = isLoggedIn ? 'flex' : 'none';
    }

    // Gestion des filtres
    if (filters) {
        filters.style.display = isLoggedIn ? 'none' : 'flex';
    }

    // Gestion du lien Login/Logout
    if (loginLink) {
        if (isLoggedIn) {
            loginLink.textContent = 'logout';
            loginLink.href = '#';
            loginLink.addEventListener('click', logout);
        } else {
            loginLink.textContent = 'login';
            loginLink.href = 'login.html';
            loginLink.removeEventListener('click', logout);
        }
    }
}

// Fonction de déconnexion
function logout(event) {
    event.preventDefault();
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    updateUIForAuthState();
    window.location.href = 'index.html';
}

// Export pour utilisation dans d'autres fichiers
export { updateUIForAuthState, logout };