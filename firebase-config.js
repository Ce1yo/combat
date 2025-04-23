// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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
const db = getFirestore(app);
const settings = {
  experimentalForceLongPolling: true,
  useFetchStreams: false
};
getFirestore(app, settings);
console.log('Firestore initialisé');

const auth = getAuth(app);
console.log('Auth initialisé');

// Vérifier l'état de l'authentification
onAuthStateChanged(auth, (user) => {
    console.log('État de l\'authentification changé:', user ? 'Utilisateur connecté' : 'Non connecté');
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