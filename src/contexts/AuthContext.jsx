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
  updateProfile
} from 'firebase/auth';
import { googleProvider } from '../firebase';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { sendOtpEmail } from '../utils/emailService';

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
        
        // Generate secure 6-digit OTP Code
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 15 * 60 * 1000; // Expires in 15 minutes
        
        // Set up the complete user document with verification and OTP details
        const userRef = doc(db, 'users', userCredential.user.uid);
        await setDoc(userRef, {
          email: email,
          displayName: name,
          streak: 0,
          scores: [],
          badges: [],
          isVerified: false,
          otp: {
            code: otpCode,
            expiresAt: expiresAt
          }
        });

        // Trigger custom HTML email using EmailJS service
        try {
          await sendOtpEmail(email, name, otpCode);
        } catch (verifErr) {
          console.error("Failed to send OTP verification email:", verifErr);
        }
      }
      return userCredential;
    });
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function sendOtpVerification(email, name) {
    if (auth.currentUser) {
      // Re-generate OTP code
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 15 * 60 * 1000;
      
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, {
        otp: {
          code: otpCode,
          expiresAt: expiresAt
        }
      }, { merge: true });

      // Trigger EmailJS dispatch
      await sendOtpEmail(email, name, otpCode);
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
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (user) {
        const userRef = doc(db, 'users', user.uid);
        
        try {
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
            const isGoogle = user.providerData.some(p => p.providerId === 'google.com');
            // First time signup initialization
            await setDoc(userRef, {
              email: user.email || '',
              displayName: user.displayName || 'Agile Thinker',
              streak: 0,
              scores: [],
              badges: [],
              isVerified: isGoogle // Google accounts are pre-verified
            });
            console.log("Firestore user profile initialized successfully for UID:", user.uid);
          }
        } catch (err) {
          console.error("Firestore user verification check failed:", err);
        }

        // Setup real-time listener for user document changes
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
    sendOtpVerification
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
