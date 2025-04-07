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
        if (!gallery) return; // Vérification que gallery existe

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
        if (!filters) return; // Vérification que filters existe

        const filterBtns = document.querySelectorAll('.filter-btn');
        if (filterBtns.length === 0) return; // Vérification que filterBtns existe

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

    // Fonction de suppression
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

    // Fonction de déconnexion
    function logout() {
        localStorage.removeItem('authToken');
        window.location.reload();
    }

    // Gestion de la modale
    const modal = document.getElementById('modal');
    const editButton = document.querySelector('.edit-button');
    const closeModal = document.querySelector('.close-modal');
    const galleryView = document.getElementById('gallery-view');
    const addPhotoView = document.getElementById('add-photo-view');
    const addPhotoBtn = document.getElementById('add-photo-btn');
    const backBtn = document.getElementById('back-btn');
    const photoInput = document.getElementById('photo-input');
    const imagePreview = document.querySelector('.image-preview');
    const addPhotoForm = document.getElementById('add-photo-form');
    const validateBtn = document.getElementById('validate-btn');


    // Ouvrir la modale
    if (editButton) {
        editButton.addEventListener('click', function(e) {
            e.preventDefault();
            if (modal) modal.style.display = 'flex';
            loadModalGallery();
        });
    }

    // Fermer la modale
    if (closeModal && modal) {
        closeModal.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }

    // Fermer en cliquant à l'extérieur
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // Basculer vers la vue d'ajout de photo
    if (addPhotoBtn && galleryView && addPhotoView) {
        addPhotoBtn.addEventListener('click', function() {
            galleryView.style.display = 'none';
            addPhotoView.style.display = 'block';
            loadCategories();
        });
    }

    // Revenir à la vue galerie
    if (backBtn && addPhotoView && galleryView) {
        backBtn.addEventListener('click', function() {
            addPhotoView.style.display = 'none';
            galleryView.style.display = 'block';
        });
    }

    // Prévisualisation de l'image
    if (photoInput && imagePreview) {
        photoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const validTypes = ['image/jpeg', 'image/png'];
                if (!validTypes.includes(file.type)) {
                    alert('Seuls les JPG et PNG sont acceptés');
                    return;
                }

                if (file.size > 4 * 1024 * 1024) {
                    alert('Le fichier est trop volumineux (max 4Mo)');
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(event) {
                    imagePreview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
                    imagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Soumission du formulaire d'ajout
    if (addPhotoForm && validateBtn && photoInput && imagePreview) {
        addPhotoForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const title = document.getElementById('photo-title');
            const category = document.getElementById('photo-category');

            if (!title || !category) {
                alert('Éléments du formulaire manquants');
                return;
            }

            const titleValue = title.value;
            const categoryValue = category.value;
            const imageFile = photoInput.files[0];

            // Validation
            if (!titleValue || !categoryValue || !imageFile) {
                alert('Veuillez remplir tous les champs');
                return;
            }

            // Désactiver le bouton pendant l'envoi
            validateBtn.disabled = true;
            validateBtn.textContent = 'Envoi en cours...';

            try {
                // Préparation des données
                const formData = new FormData();
                formData.append('title', titleValue);
                formData.append('category', categoryValue);
                formData.append('image', imageFile);

                // Envoi à l'API
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: getAuthHeader(),
                    body: formData
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Erreur lors de l\'ajout');
                }

                // Succès
                alert('Photo ajoutée avec succès!');
                addPhotoForm.reset();
                imagePreview.style.display = 'none';

                if (addPhotoView && galleryView) {
                    addPhotoView.style.display = 'none';
                    galleryView.style.display = 'block';
                }

                // Rechargement des galeries
                loadModalGallery();
                init();

            } catch (error) {
                console.error('Erreur:', error);
                alert(error.message || 'Une erreur est survenue');

                // Gestion spécifique des erreurs 401 (non autorisé)
                if (error.message.includes('401')) {
                    logout();
                }
            } finally {
                validateBtn.disabled = false;
                validateBtn.textContent = 'Valider';
            }
        });
    }

    // Charger la galerie dans la modale
    function loadModalGallery() {
        const modalGallery = document.querySelector('.modal-gallery');
        if (!modalGallery) return; // Vérification que modalGallery existe

        fetch(apiUrl)
            .then(response => response.json())
            .then(works => {
                modalGallery.innerHTML = '';

                works.forEach(work => {
                    const figure = document.createElement('figure');
                    figure.dataset.id = work.id;

                    const img = document.createElement('img');
                    img.src = work.imageUrl;
                    img.alt = work.title;

                    const deleteIcon = document.createElement('span');
                    deleteIcon.className = 'delete-icon';
                    deleteIcon.innerHTML = '&times;';
                    deleteIcon.addEventListener('click', function(e) {
                        e.stopPropagation();
                        deleteWork(work.id);
                    });

                    figure.appendChild(img);
                    figure.appendChild(deleteIcon);
                    modalGallery.appendChild(figure);
                });
            });
    }

    // Charger les catégories pour le formulaire
    function loadCategories() {
        const categorySelect = document.getElementById('photo-category');
        if (!categorySelect) return; // Vérification que categorySelect existe

        fetch('http://localhost:5678/api/categories')
            .then(response => response.json())
            .then(categories => {
                categorySelect.innerHTML = '<option value="">Sélectionnez une catégorie</option>';

                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    categorySelect.appendChild(option);
                });
            });
    }

    // Initialiser l'application
    init();
});