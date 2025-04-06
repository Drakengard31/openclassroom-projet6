// URL de base de l'API - À adapter selon ton environnement
const API_ENDPOINT = 'http://localhost:5678/api';

/**
 * Fonction d'authentification principale
 * @param {string} email - L'email de l'utilisateur
 * @param {string} password - Le mot de passe
 * @returns {Promise<{token: string, userId: number}>} Un objet contenant le token et l'ID utilisateur
 * @throws {Error} Si l'authentification échoue
 */
export async function authenticate(email, password) {
    try {
        // 1. Envoi de la requête à l'API
        const response = await fetch(`${API_ENDPOINT}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        // 2. Vérification de la réponse
        if (!response.ok) {
            // Si le statut est 401 (Unauthorized) ou autre erreur
            const errorData = await response.json();
            throw new Error(errorData.message || 'Identifiants incorrects');
        }

        // 3. Extraction des données de la réponse
        const data = await response.json();

        // 4. Validation des données reçues
        if (!data.token || !data.userId) {
            throw new Error('Réponse de l\'API invalide');
        }

        // 5. Retour des données d'authentification
        return {
            token: data.token,
            userId: data.userId
        };

    } catch (error) {
        // Gestion des erreurs réseau ou autres
        console.error('Erreur d\'authentification:', error);
        throw new Error(error.message || 'Erreur de connexion au serveur');
    }
}

/**
 * Récupère le token d'authentification stocké
 * @returns {string|null} Le token JWT ou null si non connecté
 */
export function getAuthToken() {
    return localStorage.getItem('authToken');
}

/**
 * Vérifie si l'utilisateur est authentifié
 * @returns {boolean} True si un token valide existe
 */
export function isAuthenticated() {
    return !!getAuthToken();
}

/**
 * Déconnexion de l'utilisateur
 * (Supprime le token du localStorage)
 */
export function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
}