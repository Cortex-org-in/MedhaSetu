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
        
        // Save to temporary pending_users collection instead of users collection
        const pendingRef = doc(db, 'pending_users', userCredential.user.uid);
        await setDoc(pendingRef, {
          email: email,
          displayName: name,
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
      
      const pendingRef = doc(db, 'pending_users', auth.currentUser.uid);
      await setDoc(pendingRef, {
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
    let unsubscribePending = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }
      if (unsubscribePending) {
        unsubscribePending();
        unsubscribePending = null;
      }

      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const pendingRef = doc(db, 'pending_users', user.uid);
        
        try {
          const userSnap = await getDoc(userRef);
          const pendingSnap = await getDoc(pendingRef);
          
          // Google provider logins are pre-verified, initialize directly to users collection
          if (!userSnap.exists() && !pendingSnap.exists()) {
            const isGoogle = user.providerData.some(p => p.providerId === 'google.com');
            if (isGoogle) {
              await setDoc(userRef, {
                email: user.email || '',
                displayName: user.displayName || 'Agile Thinker',
                streak: 0,
                scores: [],
                badges: [],
                isVerified: true
              });
              console.log("Firestore verified user profile initialized successfully for UID:", user.uid);
            }
          }
        } catch (err) {
          console.error("Firestore user verification check failed:", err);
        }

        // Setup real-time listener for user document changes
        unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            if (unsubscribePending) {
              unsubscribePending();
              unsubscribePending = null;
            }
            setUserData({ ...docSnap.data(), isVerified: true });
          } else {
            // Listen to pending_users instead
            if (!unsubscribePending) {
              unsubscribePending = onSnapshot(pendingRef, (pendingSnap) => {
                if (pendingSnap.exists()) {
                  setUserData({ ...pendingSnap.data(), isVerified: false });
                } else {
                  setUserData(null);
                }
              });
            }
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
      if (unsubscribePending) unsubscribePending();
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
