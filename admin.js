import { db, doc, setDoc, getDoc, collection, auth, signInWithEmailAndPassword, onAuthStateChanged, signOut, createAdminIfNeeded } from './firebase-config.js';

let isAdmin = false;
let isEditing = false;

// Vérifier si l'utilisateur est admin
async function checkAdminStatus() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
            isAdmin = !!user;
            if (user) {
                document.body.classList.add('admin-mode');
            } else {
                document.body.classList.remove('admin-mode');
            }
            resolve(!!user);
        });
    });
}

function updateAdminButton() {
    const adminButton = document.querySelector('#admin-button');
    if (!adminButton) return;

    if (isAdmin) {
        adminButton.textContent = 'Déconnexion Admin';
        adminButton.style.backgroundColor = '#4CAF50';
        document.body.classList.add('admin-mode');
    } else {
        adminButton.textContent = 'Connexion Admin';
        adminButton.style.backgroundColor = '#333';
        document.body.classList.remove('admin-mode');
    }
}

async function handleLogout() {
    try {
        await signOut(auth);
        isAdmin = false;
        updateAdminButton();
        location.reload();
    } catch (error) {
        console.error('Erreur de déconnexion:', error);
    }
}

// Création de la barre d'outils d'édition
function createEditorToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'editor-toolbar';
    toolbar.innerHTML = `
        <button data-command="bold" title="Gras"><strong>G</strong></button>
        <button data-command="italic" title="Italique"><em>I</em></button>
        <button data-command="underline" title="Souligné"><u>S</u></button>
        <div class="separator"></div>
        <button data-command="justifyLeft" title="Aligner à gauche">⫷</button>
        <button data-command="justifyCenter" title="Centrer">≡</button>
        <button data-command="justifyRight" title="Aligner à droite">⫸</button>
        <div class="separator"></div>
        <button data-command="undo" title="Annuler">↶</button>
        <button data-command="redo" title="Rétablir">↷</button>
    `;

    document.body