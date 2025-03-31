// Configuration de l'API
const API_ENDPOINT = 'http://localhost:5678/api';
const CREDENTIALS = {
    email: 'sophie.bluel@test.tld',
    password: 'S0phie'
};

// Mock de réponse API (à remplacer par un vrai fetch en production)
async function realAuth(email, password) {
    const response = await fetch(`${API_ENDPOINT}/users/${email}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password})
    });
    if (!response.ok) {
        throw new Error('Échec de l\'authentification');
        return response.json();
    }
}

// Vérifie les identifiants
export async function authenticate(email, password) {
    if (email !== CREDENTIALS.email || password !== CREDENTIALS.password) {
        throw new Error('Identifiants incorrects');
    }
    return await mockAuth(); // Remplacer par fetch() en production
}

// Gestion du token
export function getAuthToken() {
    return localStorage.getItem('authToken');
}