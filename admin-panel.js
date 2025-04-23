import { auth, onAuthStateChanged } from './firebase-config.js';

// Vérifier si l'utilisateur est connecté en tant qu'admin
function checkAdminAccess() {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            // Rediriger vers la page principale si non connecté
            window.location.href = '/';
        } else {
            // Afficher le contenu admin
            document.getElementById('admin-content').innerHTML = `
                <div class="admin-menu">
                    <h2>Options d'administration</h2>
                    <div class="admin-options">
                        <p>Le panneau d'administration est en cours de développement. 
                        D'autres options seront bientôt ajoutées.</p>
                    </div>
                </div>
            `;
        }
    });
}

// Initialiser la page
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAccess();
});
