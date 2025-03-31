import { authenticate } from './api-auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.login-form');
    const errorElement = document.createElement('p');
    errorElement.className = 'error-message';
    form.appendChild(errorElement);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorElement.textContent = '';

        try {
            const { token, userId } = await authenticate(
                form.email.value,
                form.password.value
            );

            localStorage.setItem('authToken', token);
            localStorage.setItem('userId', userId);
            window.location.href = 'index.html';

        } catch (error) {
            errorElement.textContent = error.message;
        }
    });
});