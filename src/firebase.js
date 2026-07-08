import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCcNQvK1RXV3UNeQ8F9UAacF6G5_7W76lA",
  authDomain: "seniorcitizen-b7909.firebaseapp.com",
  projectId: "seniorcitizen-b7909",
  storageBucket: "seniorcitizen-b7909.firebasestorage.app",
  messagingSenderId: "147224155859",
  appId: "1:147224155859:web:daf9e5310bf1c3c0ae2626",
  measurementId: "G-HYE6B9QHQH"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };
