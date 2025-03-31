document.addEventListener('DOMContentLoaded', function() {
    // Fonctions d'authentification
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
            // Ajouter ici les éléments d'interface admin
            console.log('Mode admin activé');
        }
    }

    // Gestion des travaux
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

    // Gestion des filtres
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

    // Initialisation
    async function init() {
        setupAdminUI();
        const works = await fetchWorks();
        displayWorks(works);
        setupFilters();
    }

    init();

    // Exemple de fonction protégée
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
                init(); // Rafraîchir la galerie
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