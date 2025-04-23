let isAdmin = false;
let isEditing = false;

// Vérifier si l'utilisateur est admin
function checkAdminStatus() {
    const password = localStorage.getItem('adminPassword');
    if (password === 'votre_mot_de_passe_admin') {
        isAdmin = true;
        return true;
    }
    return false;
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

    // Liste des sélecteurs d'éléments modifiables
    const editableSelectors = [
        '.project-title',
        '.project-description',
        '.hero-content h1',
        '.hero-content p',
        '.about-content p',
        '.section-title',
        '.section-description',
        '.footer p',
        'h1, h2, h3, h4, h5, h6',
        'p'
    ];

    // Rendre les éléments modifiables
    editableSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
            element.setAttribute('contenteditable', 'true');
            
            element.addEventListener('focus', (e) => {
                currentEditableElement = e.target;
                toolbar.classList.add('visible');
                positionToolbar(toolbar, e.target);
            });

            element.addEventListener('blur', (e) => {
                if (!e.relatedTarget || !e.relatedTarget.closest('.editor-toolbar')) {
                    toolbar.classList.remove('visible');
                    saveContent(e);
                }
            });

            element.addEventListener('input', () => {
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

// Fonction pour sauvegarder le contenu modifié
async function saveContent(event) {
    const element = event.target;
    const content = element.innerHTML;
    const selector = Array.from(element.classList).join('.') || element.tagName.toLowerCase();
    const path = window.location.pathname;

    try {
        const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/site_content`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_CONFIG.key,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify({
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
async function loadSavedContent() {
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
                element.innerHTML = item.content;
            });
        });
    } catch (error) {
        console.error('Erreur de chargement:', error);
        showErrorIndicator('Erreur lors du chargement du contenu');
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
    const password = prompt('Entrez le mot de passe administrateur :');
    if (password === 'votre_mot_de_passe_admin') {
        localStorage.setItem('adminPassword', password);
        isAdmin = true;
        makeContentEditable();
        loadSavedContent();
    } else {
        alert('Mot de passe incorrect');
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Ajouter le bouton de connexion admin
    const adminButton = document.createElement('button');
    adminButton.textContent = 'Admin';
    adminButton.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 1000; padding: 10px 20px; background: #333; color: white; border: none; border-radius: 5px; cursor: pointer;';
    document.body.appendChild(adminButton);

    adminButton.addEventListener('click', handleAdminLogin);

    if (checkAdminStatus()) {
        makeContentEditable();
        loadSavedContent();
    }
});
