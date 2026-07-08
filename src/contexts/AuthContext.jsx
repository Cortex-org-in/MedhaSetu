import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { googleProvider } from '../firebase';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  function signup(email, password, name) {
    return createUserWithEmailAndPassword(auth, email, password).then(async (userCredential) => {
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
        try {
          await sendEmailVerification(userCredential.user);
        } catch (verifErr) {
          console.error("Failed to send initial email verification:", verifErr);
        }
      }
      return userCredential;
    });
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function sendVerification() {
    if (auth.currentUser) {
      return sendEmailVerification(auth.currentUser);
    }
  }

  async function loginWithGoogle() {
    try {
      return await signInWithPopup(auth, googleProvider);
    } catch (error) {
      if (error.code === 'auth/popup-blocked') {
        console.warn("Google login popup blocked. Falling back to redirect...");
        return await signInWithRedirect(auth, googleProvider);
      }
      throw error;
    }
  }

  function logout() {
    return signOut(auth);
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  useEffect(() => {
    getRedirectResult(auth).catch(err => {
      console.error("Firebase Auth redirect error:", err);
    });

    let unsubscribeSnapshot = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      // Unsubscribe from previous snapshot if user changes
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (user) {
        const userRef = doc(db, 'users', user.uid);
        
        try {
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
            // First time signup initialization
            await setDoc(userRef, {
              email: user.email || '',
              displayName: user.displayName || 'Agile Thinker',
              streak: 0,
              scores: [],
              badges: []
            });
            console.log("Firestore user profile initialized successfully for UID:", user.uid);
          }
        } catch (err) {
          console.error("Firestore user verification/streak check failed:", err);
        }

        // Setup real-time listener for user document changes (streaks, scores, badges)
        unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        }, (err) => {
          console.error("User document real-time sync failed:", err);
        });
      } else {
        setUserData(null);
      }
      
      setCurrentUser(user);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const value = {
    currentUser,
    userData,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    sendVerification
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
