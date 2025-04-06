import {updateUIForAuthState} from './auth-ui.js';
import { authenticate } from './api-auth.js';

document.addEventListener('DOMContentLoaded', function() {
    // Gestion du formulaire de connexion
    const loginForm = document.querySelector('.login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                // Authentification
                const { token, userId } = await authenticate(email, password);

                // Stockage des informations de connexion
                localStorage.setItem('authToken', token);
                localStorage.setItem('userId', userId);

                // Redirection vers la page d'accueil
                window.location.href = 'index.html';

            } catch (error) {
                alert(error.message || 'Erreur lors de la connexion');
            }
        });
    }

    // Fonctions d'authentification existantes
    function isLoggedIn() {
        return !!localStorage.getItem('authToken');
    }

    function getAuthHeader() {
        return {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        };
    }

    function setupAdminUI() {
        if (isLoggedIn()) {
            console.log('Mode admin activé');
        }
        updateUIForAuthState();
    }

    // Gestion des travaux (ton code existant)
    const apiUrl = 'http://localhost:5678/api/works';
    const gallery = document.querySelector('.gallery');

    async function fetchWorks() {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Erreur réseau');
            return await response.json();
        } catch (error) {
            console.error('Erreur:', error);
            return [];
        }
    }

    function displayWorks(works, categoryId = 0) {
        gallery.innerHTML = '';
        const filteredWorks = categoryId === 0
            ? works
            : works.filter(work => work.categoryId === categoryId);

        filteredWorks.forEach(work => {
            const figure = document.createElement('figure');
            figure.dataset.id = work.id;

            const img = document.createElement('img');
            img.src = work.imageUrl;
            img.alt = work.title;

            const figcaption = document.createElement('figcaption');
            figcaption.textContent = work.title;

            figure.appendChild(img);
            figure.appendChild(figcaption);
            gallery.appendChild(figure);
        });
    }

    // Gestion des filtres (ton code existant)
    function setupFilters() {
        const editBtn = document.querySelector('.edit-button');
        if (!editBtn) return;

        const filters = document.querySelector('.category-filters');
        const filterBtns = document.querySelectorAll('.filter-btn');

        editBtn.addEventListener('click', function() {
            filters.style.display = filters.style.display === 'none' ? 'flex' : 'none';
            editBtn.style.display = 'none';
        });

        filterBtns.forEach(btn => {
            btn.addEventListener('click', async function() {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                const works = await fetchWorks();
                const categoryId = parseInt(this.dataset.category);
                displayWorks(works, categoryId);
            });
        });
    }

    // Initialisation (ton code existant)
    async function init() {
        setupAdminUI();
        const works = await fetchWorks();
        displayWorks(works);
        setupFilters();
    }

    init();

    // Fonctions protégées (ton code existant)
    async function deleteWork(workId) {
        if (!isLoggedIn()) {
            alert('Veuillez vous connecter');
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/${workId}`, {
                method: 'DELETE',
                headers: getAuthHeader()
            });

            if (response.ok) {
                init();
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    }

    function logout() {
        localStorage.removeItem('authToken');
        window.location.reload();
    }
});