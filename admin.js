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
            element.setAttribute('content