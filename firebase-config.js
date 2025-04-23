// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, doc, setDoc, getDoc, collection, auth, signInWithEmailAndPassword, onAuthStateChanged, signOut };