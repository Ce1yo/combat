let isAdmin = false;
let isEditing = false;

// Vérifier si l'utilisateur est admin
function checkAdminStatus() {
    const password = localStorage.getItem('adminPassword');
    if (password === '1234') {
        isAdmin = true;
        return true;
    }
    return false;
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

function handleLogout() {
    localStorage.removeItem('adminPassword');
    isAdmin = false;
    updateAdminButton();
    location.reload();
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
function makeContentEditable() {
    if (!checkAdminStatus()) return;

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
        '.project-title',
        '.project-description',
        '.about-text',
        '.contact-text',
        'p',
        'h1',
        'h2',
        'h3'
    ];

    // Fonction pour sauvegarder tous les éléments modifiés
    async function saveAllModifiedContent() {
        try {
            const promises = Array.from(modifiedElements).map(element => {
                const content = element.innerHTML;
                const selector = Array.from(element.classList).join('.') || element.tagName.toLowerCase();
                const path = window.location.pathname;

                return fetch(
                    `${SUPABASE_CONFIG.url}/rest/v1/site_content?path=eq.${encodeURIComponent(path)}&selector=eq.${encodeURIComponent(selector)}`,
                    {
                        headers: {
                            'apikey': SUPABASE_CONFIG.key
                        }
                    }
                ).then(checkResponse => checkResponse.json())
                .then(existingEntries => {
                    const method = existingEntries.length > 0 ? 'PATCH' : 'POST';
                    const url = existingEntries.length > 0 ?
                        `${SUPABASE_CONFIG.url}/rest/v1/site_content?path=eq.${encodeURIComponent(path)}&selector=eq.${encodeURIComponent(selector)}` :
                        `${SUPABASE_CONFIG.url}/rest/v1/site_content`;

                    return fetch(url, {
                        method: method,
                        headers: {
                            'apikey': SUPABASE_CONFIG.key,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=minimal'
                        },
                        body: JSON.stringify({
                            path,
                            selector,
                            content,
                            updated_at: new Date().toISOString()
                        })
                    });
                });
            });

            await Promise.all(promises);
            modifiedElements.clear();
            saveButton.style.display = 'none';
            showSavedIndicator();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            showErrorIndicator('Erreur lors de la sauvegarde');
        }
    }

    // Ajouter le gestionnaire d'événements pour le bouton de sauvegarde
    saveButton.addEventListener('click', saveAllModifiedContent);

    // Rendre les éléments modifiables
    editableSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
            element.contentEditable = true;
            element.classList.add('editable');

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
        const currentPath = window.location.pathname;
        const response = await fetch(
            `${SUPABASE_CONFIG.url}/rest/v1/site_content?path=eq.${encodeURIComponent(currentPath)}`, {
            headers: {
                'apikey': SUPABASE_CONFIG.key
            }
        });

        if (!response.ok) throw new Error('Erreur lors du chargement');
        
        const contents = await response.json();
        contents.forEach(item => {
            const elements = document.querySelectorAll('.' + item.selector) || 
                           document.querySelectorAll(item.selector);
            elements.forEach(element => {
                // Ne pas mettre à jour si l'élément est en cours d'édition
                if (!element.isContentEditable) {
                    element.innerHTML = item.content;
                }
            });
        });
    } catch (error) {
        console.error('Erreur de chargement:', error);
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

// Fonction pour gérer la connexion admin
function handleAdminLogin() {
    if (isAdmin) {
        if (confirm('Voulez-vous vous déconnecter ?')) {
            handleLogout();
        }
        return;
    }

    const password = prompt('Entrez le mot de passe administrateur :');
    if (password === '1234') {
        localStorage.setItem('adminPassword', password);
        isAdmin = true;
        makeContentEditable();
        loadSavedContent();
        updateAdminButton();
    } else {
        alert('Mot de passe incorrect');
    }
}

// Fonction pour actualiser périodiquement le contenu
function startAutoRefresh() {
    // Charger le contenu immédiatement
    loadSavedContent();
    
    // Actualiser toutes les 30 secondes
    setInterval(loadSavedContent, 30000);
}

// Style pour le mode admin
const style = document.createElement('style');
style.textContent = `
    .admin-mode .editable {
        outline: 2px dashed #4CAF50;
        position: relative;
    }
    .admin-mode .editable:hover {
        outline: 2px solid #4CAF50;
        background: rgba(76, 175, 80, 0.1);
    }
    #admin-button {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        padding: 10px 20px;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.3s ease;
    }
    #admin-button:hover {
        transform: scale(1.05);
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }
`;
document.head.appendChild(style);

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier si le bouton admin existe déjà
    if (!document.querySelector('#admin-button')) {
        const adminButton = document.createElement('button');
        adminButton.id = 'admin-button';
        adminButton.addEventListener('click', handleAdminLogin);
        document.body.appendChild(adminButton);
    }

    // Mettre à jour l'apparence du bouton
    updateAdminButton();

    // Rendre le contenu modifiable si admin
    if (checkAdminStatus()) {
        makeContentEditable();
    }

    // Démarrer l'actualisation automatique pour tous les utilisateurs
    startAutoRefresh();
});
