// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Ré-exporter les fonctions Firebase pour les autres modules
export { doc, setDoc, getDoc, collection, addDoc, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
export { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDnQdBq2i4mAunIYh5EVe2DkGniLeA2C84",
  authDomain: "esprit-combat.firebaseapp.com",
  projectId: "esprit-combat",
  storageBucket: "esprit-combat.firebasestorage.app",
  messagingSenderId: "363429643930",
  appId: "1:363429643930:web:e53c3950caac81bc994123",
  measurementId: "G-6YRWHECNLK"
};

// Initialize Firebase
console.log('Initialisation de Firebase...');
const app = initializeApp(firebaseConfig);
console.log('Firebase app initialisée:', app);

// Configuration de Firestore avec CORS
// Configuration de Firestore
const db = getFirestore(app);
const settings = {
  experimentalAutoDetectLongPolling: true,
  experimentalForceLongPolling: true,
  useFetchStreams: false
};

// Appliquer les paramètres à Firestore
const firestoreWithSettings = getFirestore(app);
firestoreWithSettings._settings = settings;
console.log('Firestore initialisé');

const auth = getAuth(app);
console.log('Auth initialisé');

// Vérifier l'état de l'authentification
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log('État de l\'authentification changé: Utilisateur connecté');
        // Vérifier si l'utilisateur est admin
        try {
            const adminDoc = await getDoc(doc(db, 'admins', user.uid));
            if (adminDoc.exists()) {
                console.log('Utilisateur est admin');
            } else {
                console.log('Utilisateur n\'est pas admin');
                // Créer le document admin pour l'utilisateur actuel
                try {
                    await setDoc(doc(db, 'admins', user.uid), {
                        email: user.email,
                        role: 'admin'
                    });
                    console.log('Document admin créé avec succès');
                } catch (error) {
                    console.error('Erreur lors de la création du document admin:', error);
                }
            }
        } catch (error) {
            console.error('Erreur lors de la vérification du statut admin:', error);
        }
    } else {
        console.log('État de l\'authentification changé: Non connecté');
    }
});

// Fonction pour créer un utilisateur admin si nécessaire
async function createAdminIfNeeded(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('Utilisateur admin créé:', userCredential.user);
        return userCredential;
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            console.log('L\'utilisateur existe déjà, tentative de connexion...');
            return signInWithEmailAndPassword(auth, email, password);
        }
        throw error;
    }
}

export { 
    db,
    auth,
    createAdminIfNeeded 
};