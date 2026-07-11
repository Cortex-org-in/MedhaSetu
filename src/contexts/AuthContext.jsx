import React, { createContext, useContext, useEffect, useState } from 'react';
import Mascot from '../components/Mascot';
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
import { doc, setDoc, getDoc, onSnapshot, query, collection, where, getDocs } from 'firebase/firestore';
import { sendOtpEmail } from '../utils/emailService';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguageState] = useState(localStorage.getItem('medhasetu_lang') || 'en');

  const updateLanguage = async (lang) => {
    setLanguageState(lang);
    localStorage.setItem('medhasetu_lang', lang);
    if (currentUser) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, { language: lang }, { merge: true });
      } catch (err) {
        console.error("Failed to sync language to Firestore:", err);
      }
    }
  };

  async function signup(email, password, name) {
    // 1. Check if email already exists in registered users collection
    const q = query(collection(db, 'users'), where('email', '==', email.toLowerCase()));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      throw new Error("Email already in use.");
    }

    // 2. Generate secure 6-digit OTP Code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // Expires in 15 minutes
    
    // 3. Save details to temporary pending_registrations collection
    const pendingRef = doc(db, 'pending_registrations', email.toLowerCase());
    await setDoc(pendingRef, {
      email: email.toLowerCase(),
      displayName: name,
      password: password,
      otp: {
        code: otpCode,
        expiresAt: expiresAt
      }
    });

    // 4. Save email in localStorage for verify-email screen reference
    localStorage.setItem('pending_signup_email', email.toLowerCase());

    // 5. Trigger custom HTML email using EmailJS service
    try {
      await sendOtpEmail(email, name, otpCode);
    } catch (verifErr) {
      console.error("Failed to send OTP verification email:", verifErr);
    }
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function sendOtpVerification(email, name) {
    // Re-generate OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000;
    
    const pendingRef = doc(db, 'pending_registrations', email.toLowerCase());
    await setDoc(pendingRef, {
      otp: {
        code: otpCode,
        expiresAt: expiresAt
      }
    }, { merge: true });

    // Trigger EmailJS dispatch
    await sendOtpEmail(email, name, otpCode);
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
    const startTime = Date.now();

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
          
          // Google provider logins are pre-verified, initialize directly to users collection
          if (!userSnap.exists()) {
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
            const data = docSnap.data();
            setUserData(data);
            if (data.language && data.language !== localStorage.getItem('medhasetu_lang')) {
              setLanguageState(data.language);
              localStorage.setItem('medhasetu_lang', data.language);
            }
          } else {
            setUserData(null);
          }
          
          const elapsed = Date.now() - startTime;
          const remainingTime = Math.max(0, 1500 - elapsed);
          setTimeout(() => {
            setLoading(false);
          }, remainingTime);
        }, (err) => {
          console.error("User document real-time sync failed:", err);
          
          const elapsed = Date.now() - startTime;
          const remainingTime = Math.max(0, 1500 - elapsed);
          setTimeout(() => {
            setLoading(false);
          }, remainingTime);
        });
      } else {
        setUserData(null);
        
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, 1500 - elapsed);
        setTimeout(() => {
          setLoading(false);
        }, remainingTime);
      }
      
      setCurrentUser(user);
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
    sendOtpVerification,
    language,
    updateLanguage
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#f3f5f7',
          padding: '20px'
        }}>
          <div className="app-container" style={{
            maxWidth: '520px',
            padding: '40px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px'
          }}>
            <Mascot state="loading" width="280" height="280" />
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
