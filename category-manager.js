import { db, collection, addDoc } from './firebase-config.js';

// Collection des catégories dans Firestore
const categoriesCollection = collection(db, 'categories');

// Fonction pour créer une nouvelle catégorie
async function createNewCategory(title, description, imageFile) {
    try {
        // Vérifier que tous les champs sont remplis
        if (!title || !description || !imageFile) {
            throw new Error('Tous les champs sont requis');
        }

        // Convertir l'image en Base64
        const imageBase64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(imageFile);
        });

        // Créer l'objet catégorie
        const newCategory = {
            title: title,
            description: description,
            image: imageBase64,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            articles: [] // Liste vide d'articles au départ
        };

        // Ajouter la catégorie à Firestore
        const docRef = await addDoc(categoriesCollection, newCategory);
        
        // Retourner l'ID du document créé
        return docRef.id;
    } catch (error) {
        console.error('Erreur lors de la création de la catégorie:', error);
        throw error;
    }
}

// Fonction pour ouvrir le formulaire d'ajout de catégorie
window.showAddCategoryForm = function() {
    const overlay = document.getElementById('addCategoryForm');
    overlay.classList.add('visible');
    // Focus sur le champ titre après l'animation
    setTimeout(() => {
        document.getElementById('categoryTitle').focus();
    }, 300);
};

// Fonction pour fermer le formulaire d'ajout de catégorie
window.closeAddCategoryForm = function() {
    const overlay = document.getElementById('addCategoryForm');
    overlay.classList.remove('visible');
};

// Fonction pour gérer la prévisualisation de l'image
function handleImagePreview(file) {
    const preview = document.getElementById('previewImg');
    const container = document.querySelector('.image-upload-container');
    const reader = new FileReader();

    reader.onload = function(e) {
        preview.src = e.target.result;
        preview.style.display = 'block';
        container.classList.add('has-image');
    };

    if (file) {
        reader.readAsDataURL(file);
    }
}

// Fonction pour gérer le drag & drop
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        const input = document.getElementById('categoryImage');
        input.files = e.dataTransfer.files;
        handleImagePreview(file);
    }
}

// Fermer la modale en cliquant sur l'overlay
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('addCategoryForm');
    const uploadContainer = document.querySelector('.image-upload-container');
    const imageInput = document.getElementById('categoryImage');

    // Gérer la fermeture de la modale
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeAddCategoryForm();
        }
    });

    // Gérer l'upload d'image
    if (uploadContainer) {
        uploadContainer.addEventListener('dragover', handleDragOver);
        uploadContainer.addEventListener('dragleave', handleDragLeave);
        uploadContainer.addEventListener('drop', handleDrop);
    }

    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                handleImagePreview(e.target.files[0]);
            }
        });
    }

    // Ajouter l'écouteur d'événement pour le bouton d'ajout
    const addButton = document.getElementById('addCategoryBtn');
    if (addButton) {
        addButton.addEventListener('click', showAddCategoryForm);
    }

    // Gérer la soumission du formulaire
    const form = document.getElementById('newCategoryForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Récupérer les valeurs du formulaire
            const title = document.getElementById('categoryTitle').value.trim();
            const description = document.getElementById('categoryDescription').value.trim();
            const imageFile = document.getElementById('categoryImage').files[0];

            // Afficher un spinner de chargement
            const submitButton = form.querySelector('.btn-submit');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Création en cours...';

            try {
                // Créer la nouvelle catégorie
                await createNewCategory(title, description, imageFile);

                // Afficher un message de succès
                const successMessage = document.createElement('div');
                successMessage.className = 'success-message';
                successMessage.textContent = 'Catégorie créée avec succès !';
                form.appendChild(successMessage);

                // Réinitialiser le formulaire
                form.reset();
                document.getElementById('previewImg').style.display = 'none';
                document.querySelector('.image-upload-container').classList.remove('has-image');

                // Fermer le formulaire après un court délai
                setTimeout(() => {
                    closeAddCategoryForm();
                    location.reload(); // Recharger la page pour afficher la nouvelle catégorie
                }, 1500);

            } catch (error) {
                console.error('Erreur:', error);
                alert(error.message || 'Une erreur est survenue lors de la création de la catégorie');
            } finally {
                // Rétablir le bouton
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }
});
