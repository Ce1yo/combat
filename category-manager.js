import { db, collection, addDoc } from './firebase-config.js';

// Collection des catégories dans Firestore
const categoriesCollection = collection(db, 'categories');

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

            const imageFile = document.getElementById('categoryImage').files[0];
            if (!imageFile) {
                alert('Veuillez sélectionner une image');
                return;
            }

            try {
                // Convertir l'image en Base64
                const reader = new FileReader();
                reader.onload = async function(e) {
                    const imageBase64 = e.target.result;

                    const newCategory = {
                        title: document.getElementById('categoryTitle').value,
                        description: document.getElementById('categoryDescription').value,
                        image: imageBase64,
                        createdAt: new Date().toISOString()
                    };

                    try {
                        await addDoc(categoriesCollection, newCategory);
                        alert('Catégorie ajoutée avec succès !');
                        form.reset();
                        closeAddCategoryForm();
                        location.reload(); // Recharger la page pour afficher la nouvelle catégorie
                    } catch (error) {
                        console.error('Erreur lors de l\'ajout de la catégorie:', error);
                        alert('Erreur lors de l\'ajout de la catégorie');
                    }
                };

                reader.readAsDataURL(imageFile);
            } catch (error) {
                console.error('Erreur lors du traitement de l\'image:', error);
                alert('Erreur lors du traitement de l\'image');
            }
        });
    }
});
