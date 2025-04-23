import { db, doc, setDoc, getDoc, collection, auth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from './firebase-config.js';

let isAdmin = false;
let isEditing = false;

// Vérifier si l'utilisateur est admin
async function checkAdminStatus() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
            isAdmin = !!user;
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

    document.body.appendChild(toolbar);
    return toolbar;
}

// Fonction pour positionner la barre d'outils
function positionToolbar(toolbar, element) {
    const elementRect = element.getBoundingClientRect();
    const toolbarRect = toolbar.getBoundingClientRect();
    
    let top = elementRect.top - toolbarRect.height - 10;
    if (top < 10) top = elementRect.bottom + 10;
    
    let left = elementRect.left;
    if (left + toolbarRect.width > window.innerWidth) {
        left = window.innerWidth - toolbarRect.width - 10;
    }

    toolbar.style.top = `${top}px`;
    toolbar.style.left = `${left}px`;
}

// Fonction pour rendre les éléments modifiables
async function makeContentEditable() {
    const isAdminUser = await checkAdminStatus();
    if (!isAdminUser) {
        // Désactiver l'édition si pas admin
        document.querySelectorAll('.editable').forEach(el => {
            el.contentEditable = 'false';
            el.classList.remove('editable');
        });
        return;
    }

    const toolbar = createEditorToolbar();
    let currentEditableElement = null;
    let modifiedElements = new Set();

    // Créer le bouton de sauvegarde
    const saveButton = document.createElement('button');
    saveButton.id = 'save-button';
    saveButton.textContent = 'Sauvegarder les modifications';
    saveButton.style.cssText = 'position: fixed; bottom: 20px; right: 120px; z-index: 1000; padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; display: none;';
    document.body.appendChild(saveButton);

    // Liste des sélecteurs d'éléments modifiables
    const editableSelectors = [
        // Hero section
        '.home-hero .hero-text p',
        '.home-hero h1',
        
        // Values section
        '.values-section > h2:first-of-type',
        '.values-section > .section-intro',
        '.value-card:nth-child(1) h3',
        '.value-card:nth-child(1) p',
        '.value-card:nth-child(2) h3',
        '.value-card:nth-child(2) p',
        '.value-card:nth-child(3) h3',
        '.value-card:nth-child(3) p',
        '.value-card:nth-child(3) .text-link',
        
        // Portfolio section
        '.portfolio-content > h2',
        '.portfolio-text > p',
        '.slide:nth-child(1) .slide-title[data-project="1"]',
        '.slide:nth-child(1) .slide-description[data-project="1"]',
        '.slide:nth-child(2) .slide-title[data-project="2"]',
        '.slide:nth-child(2) .slide-description[data-project="2"]',
        '.slide:nth-child(3) .slide-title[data-project="3"]',
        '.slide:nth-child(3) .slide-description[data-project="3"]',
        
        // Social section
        '.social-section > h2',
        '.social-content > p',
        
        // Footer
        '.contact-info > h3',
        '.contact-info > p',
        '.contact-info > a'
    ];

    // Rendre les éléments éditables uniquement si admin
    editableSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
            if (isAdminUser) {
                element.contentEditable = 'true';
                element.classList.add('editable');
                element.setAttribute('data-original-selector', selector);
            } else {
                element.contentEditable = 'false';
                element.classList.remove('editable');
                element.removeAttribute('data-original-selector');
            }
        });
    });

    // Fonction pour sauvegarder tous les éléments modifiés
    async function saveAllModifiedContent() {
        try {
            if (!auth.currentUser) {
                throw new Error('Vous devez être connecté pour sauvegarder les modifications');
            }

            const path = window.location.pathname.replace('/', '') || 'index';
            const contentRef = doc(db, 'pages', path, 'content', 'data');
            const batch = {};
            
            Array.from(modifiedElements).forEach(element => {
                const content = element.innerHTML;
                const selector = element.getAttribute('data-original-selector');
                
                batch[selector] = {
                    content,
                    updated_at: new Date().toISOString(),
                    updatedBy: auth.currentUser.email
                };
            });

            await setDoc(contentRef, batch, { merge: true });
            modifiedElements.clear();
            saveButton.style.display = 'none';
            showSavedIndicator();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            const message = error.code === 'permission-denied' 
                ? 'Vous n\'avez pas les permissions nécessaires. Veuillez vous reconnecter.'
                : 'Erreur lors de la sauvegarde: ' + error.message;
            showErrorIndicator(message);
            if (error.code === 'permission-denied') {
                setTimeout(() => handleLogout(), 2000);
            }
        }
    }

    // Ajouter le gestionnaire d'événements pour le bouton de sauvegarde
    saveButton.addEventListener('click', saveAllModifiedContent);

    // Rendre les éléments modifiables
    editableSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
            // Vérifier si l'élément a du contenu
            if (element.textContent.trim()) {
                element.contentEditable = true;
                element.classList.add('editable');

                // Ajouter un attribut data-original-selector pour la sauvegarde
                element.setAttribute('data-original-selector', selector);

                // Gestionnaire d'événements pour le focus
                element.addEventListener('focus', () => {
                    currentEditableElement = element;
                    positionToolbar(toolbar, element);
                    toolbar.style.display = 'flex';
                });

                // Gestionnaire d'événements pour la perte de focus
                element.addEventListener('blur', () => {
                    if (!toolbar.contains(document.activeElement)) {
                        toolbar.style.display = 'none';
                    }
                });

                // Gestionnaire d'événements pour les modifications
                element.addEventListener('input', () => {
                    modifiedElements.add(element);
                    saveButton.style.display = 'block';
                    showModifiedIndicator();
                });
            }
        });
    });

    // Gestionnaire d'événements pour les boutons de la barre d'outils
    toolbar.querySelectorAll('button').forEach(button => {
        button.addEventListener('mousedown', (e) => {
            e.preventDefault(); // Empêche la perte du focus
            const command = button.dataset.command;
            document.execCommand(command, false, null);
            currentEditableElement?.focus();
        });
    });
}

// Fonction pour sauvegarder le contenu modifié (non utilisée directement)
async function saveContent(element) {
    if (!element) return;

    const content = element.innerHTML;
    const selector = Array.from(element.classList).join('.') || element.tagName.toLowerCase();
    const path = window.location.pathname;

    try {
        // D'abord, vérifier si l'entrée existe
        const checkResponse = await fetch(
            `${SUPABASE_CONFIG.url}/rest/v1/site_content?path=eq.${encodeURIComponent(path)}&selector=eq.${encodeURIComponent(selector)}`,
            {
                headers: {
                    'apikey': SUPABASE_CONFIG.key
                }
            }
        );

        const existingEntries = await checkResponse.json();
        const method = existingEntries.length > 0 ? 'PATCH' : 'POST';
        const url = existingEntries.length > 0 ?
            `${SUPABASE_CONFIG.url}/rest/v1/site_content?path=eq.${encodeURIComponent(path)}&selector=eq.${encodeURIComponent(selector)}` :
            `${SUPABASE_CONFIG.url}/rest/v1/site_content`;

        const response = await fetch(url, {
            method: method,
            headers: {
                'apikey': SUPABASE_CONFIG.key,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(method === 'PATCH' ? {
                content,
                updated_at: new Date().toISOString()
            } : {
                path,
                selector,
                content,
                updated_at: new Date().toISOString()
            })
        });

        if (response.ok) {
            showSavedIndicator();
        } else {
            throw new Error('Erreur lors de la sauvegarde');
        }
    } catch (error) {
        console.error('Erreur de sauvegarde:', error);
        showErrorIndicator();
    }
}

// Fonction pour afficher l'indicateur de modification
function showModifiedIndicator() {
    let indicator = document.querySelector('.content-modified');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'content-modified';
        indicator.textContent = 'Modifications non sauvegardées';
        document.body.appendChild(indicator);
    }
    indicator.classList.add('visible');
}

// Fonction pour afficher l'indicateur de sauvegarde
function showSavedIndicator() {
    const indicator = document.querySelector('.content-modified');
    if (indicator) {
        indicator.textContent = 'Modifications sauvegardées';
        setTimeout(() => {
            indicator.classList.remove('visible');
        }, 2000);
    }
}

// Fonction pour charger le contenu sauvegardé
async function loadSavedContent(showError = false) {
    try {
        const path = window.location.pathname.replace('/', '') || 'index';
        const contentRef = doc(db, 'pages', path, 'content', 'data');
        const docSnap = await getDoc(contentRef);

        if (docSnap.exists()) {
            const savedContent = docSnap.data();
            Object.entries(savedContent).forEach(([selector, data]) => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    element.innerHTML = data.content;
                });
            });
        }
    } catch (error) {
        console.error('Erreur lors du chargement du contenu:', error);
        if (showError) {
            showErrorIndicator('Erreur lors du chargement du contenu');
        }
    }
}

// Fonction pour afficher une erreur
function showErrorIndicator(message = 'Erreur lors de la sauvegarde') {
    const indicator = document.querySelector('.content-modified') || document.createElement('div');
    indicator.className = 'content-modified error';
    indicator.textContent = message;
    if (!indicator.parentNode) document.body.appendChild(indicator);
    indicator.classList.add('visible');
    
    setTimeout(() => {
        indicator.classList.remove('visible');
    }, 3000);
}

// Fonction pour créer l'overlay de connexion admin
function createAdminLoginOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'admin-overlay';
    overlay.innerHTML = `
        <form class="admin-login-form" onsubmit="return false;">
            <button type="button" class="close-admin-login">&times;</button>
            <h2>Connexion Admin</h2>
            <input type="email" id="admin-email" placeholder="Email admin" required>
            <input type="password" id="admin-password" placeholder="Mot de passe" required>
            <button type="submit">Se connecter</button>
        </form>
    `;

    document.body.appendChild(overlay);

    const form = overlay.querySelector('form');
    const closeButton = overlay.querySelector('.close-admin-login');

    closeButton.addEventListener('click', () => {
        overlay.style.display = 'none';
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Tentative de connexion...');
        const email = form.querySelector('#admin-email').value;
        const password = form.querySelector('#admin-password').value;
        console.log('Email:', email);

        try {
            console.log('Appel à signInWithEmailAndPassword...');
            console.log('Auth object:', auth);
            console.log('Email et password présents:', !!email, !!password);

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('Connexion réussie:', userCredential);
            isAdmin = true;
            updateAdminButton();
            showSavedIndicator();
            makeContentEditable();
            overlay.style.display = 'none';
            location.reload(); // Recharger la page pour mettre à jour l'interface
        } catch (error) {
            console.error('Erreur de connexion détaillée:', {
                code: error.code,
                message: error.message,
                stack: error.stack
            });
            let errorMessage = 'Erreur de connexion';
            switch(error.code) {
                case 'auth/invalid-email':
                    errorMessage = 'Adresse email invalide';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'Utilisateur non trouvé';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Mot de passe incorrect';
                    break;
                default:
                    errorMessage = `Erreur: ${error.message}`;
            }
            showErrorIndicator(errorMessage);
        }
    });

    return overlay;
}

// Fonction pour gérer la connexion admin
async function handleAdminLogin() {
    if (isAdmin) {
        await handleLogout();
        return;
    }

    const overlay = document.querySelector('.admin-overlay') || createAdminLoginOverlay();
    overlay.style.display = 'flex';
}

// Fonction pour actualiser périodiquement le contenu et vérifier les permissions
function startAutoRefresh() {
    // Vérifier les permissions et charger le contenu immédiatement
    const checkPermissionsAndLoad = async () => {
        await makeContentEditable();
        await loadSavedContent();
    };
    
    checkPermissionsAndLoad();
    
    // Actualiser toutes les 30 secondes
    setInterval(checkPermissionsAndLoad, 30000);
}

// Créer le bouton admin immédiatement
function createAdminButton() {
    if (!document.querySelector('#admin-button')) {
        const adminButton = document.createElement('button');
        adminButton.id = 'admin-button';
        adminButton.textContent = 'Mode Admin';
        adminButton.addEventListener('click', handleAdminLogin);
        document.body.appendChild(adminButton);
        updateAdminButton();
    }
}

// Initialiser l'interface admin au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    createAdminButton();
    checkAdminStatus().then(isAdmin => {
        if (isAdmin) {
            makeContentEditable();
        }
    });
});

// Style pour le mode admin
const style = document.createElement('style');
style.textContent = `
    .editable {
        position: relative;
        outline: 1px dashed #ccc;
        padding: 5px;
        min-height: 20px;
        transition: outline-color 0.3s ease;
    }

    .editable:hover {
        outline-color: #4CAF50;
    }

    .editable:focus {
        outline: 2px solid #4CAF50;
    }

    .editor-toolbar {
        position: absolute;
        display: none;
        background: #333;
        padding: 5px;
        border-radius: 3px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 1000;
    }

    .editor-toolbar button {
        background: none;
        border: none;
        color: white;
        padding: 5px 10px;
        cursor: pointer;
        margin: 0 2px;
    }

    .editor-toolbar button:hover {
        background: #444;
    }

    .editor-toolbar .separator {
        display: inline-block;
        width: 1px;
        height: 20px;
        background: #666;
        margin: 0 5px;
        vertical-align: middle;
    }

    .status-indicator {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 10px 20px;
        border-radius: 5px;
        color: white;
        z-index: 1001;
        animation: fadeInOut 3s ease forwards;
    }

    @keyframes fadeInOut {
        0% { opacity: 0; transform: translateY(-20px); }
        10% { opacity: 1; transform: translateY(0); }
        90% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-20px); }
    }
`;

document.head.appendChild(style);

// Créer le bouton admin dès que possible
createAdminButton();

// S'assurer que le bouton est créé même si le script est chargé après le DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createAdminButton);
}

// Vérifier l'état de connexion et mettre à jour l'interface
onAuthStateChanged(auth, (user) => {
    isAdmin = !!user;
    updateAdminButton();
    if (isAdmin) {
        makeContentEditable();
    }
});

// Démarrer l'actualisation automatique pour tous les utilisateurs
startAutoRefresh();
