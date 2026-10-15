import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCcNQvK1RXV3UNeQ8F9UAacF6G5_7W76lA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "seniorcitizen-b7909.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "seniorcitizen-b7909",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "seniorcitizen-b7909.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "147224155859",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:147224155859:web:daf9e5310bf1c3c0ae2626",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-HYE6B9QHQH"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };
