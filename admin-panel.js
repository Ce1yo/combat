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
                        <div class="categories-list"></div>
                        <form id="newCategoryForm">
                            <label for="categoryTitle">Titre de la catégorie:</label>
                            <input type="text" id="categoryTitle" name="categoryTitle"><br><br>
                            <label for="categoryDescription">Description de la catégorie:</label>
                            <textarea id="categoryDescription" name="categoryDescription"></textarea><br><br>
                            <label for="categoryImage">Image de la catégorie:</label>
                            <input type="text" id="categoryImage" name="categoryImage"><br><br>
                            <label for="categoryLink">Lien de la catégorie:</label>
                            <input type="text" id="categoryLink" name="categoryLink"><br><br>
                            <input type="submit" value="Ajouter la catégorie">
                        </form>
                    </div>
                </div>
            `;

            // Collection des catégories dans Firestore
            const categoriesCollection = collection(db, 'categories');

            // Fonction pour charger et afficher les catégories
            async function loadCategories() {
                try {
                    const categoriesSnapshot = await getDocs(categoriesCollection);
                    const categoriesList = document.querySelector('.categories-list');
                    categoriesList.innerHTML = '';

                    categoriesSnapshot.forEach(doc => {
                        const category = doc.data();
                        const categoryElement = createCategoryElement(doc.id, category);
                        categoriesList.appendChild(categoryElement);
                    });
                } catch (error) {
                    console.error('Erreur lors du chargement des catégories:', error);
                }
            }

            // Fonction pour créer l'élément HTML d'une catégorie
            function createCategoryElement(id, category) {
                const div = document.createElement('div');
                div.className = 'category-item';
                div.innerHTML = `
                    <img src="${category.image}" alt="${category.title}">
                    <h3>${category.title}</h3>
                    <p>${category.description}</p>
                    <div class="category-actions">
                        <button class="btn-delete" data-id="${id}">Supprimer</button>
                    </div>
                `;

                // Ajouter l'écouteur d'événement pour le bouton de suppression
                div.querySelector('.btn-delete').addEventListener('click', () => deleteCategory(id));

                return div;
            }

            // Fonction pour ajouter une nouvelle catégorie
            async function addCategory(e) {
                e.preventDefault();

                const newCategory = {
                    title: document.getElementById('categoryTitle').value,
                    description: document.getElementById('categoryDescription').value,
                    image: document.getElementById('categoryImage').value,
                    link: document.getElementById('categoryLink').value,
                    createdAt: new Date().toISOString()
                };

                try {
                    const docRef = await addDoc(categoriesCollection, newCategory);
                    console.log('Catégorie ajoutée avec ID:', docRef.id);
                    document.getElementById('newCategoryForm').reset();
                    loadCategories(); // Recharger la liste des catégories
                } catch (error) {
                    console.error('Erreur lors de l\'ajout de la catégorie:', error);
                }
            }

            // Fonction pour supprimer une catégorie
            async function deleteCategory(categoryId) {
                if (confirm('Voulez-vous vraiment supprimer cette catégorie ?')) {
                    try {
                        await deleteDoc(doc(categoriesCollection, categoryId));
                        console.log('Catégorie supprimée:', categoryId);
                        loadCategories(); // Recharger la liste des catégories
                    } catch (error) {
                        console.error('Erreur lors de la suppression de la catégorie:', error);
                    }
                }
            }

            // Initialisation
            loadCategories();
            document.getElementById('newCategoryForm').addEventListener('submit', addCategory);
        }
    });
}

// Initialiser la page
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAccess();
});
