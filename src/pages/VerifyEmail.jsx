import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getFriendlyAuthErrorMessage } from '../utils/authErrorTranslator';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

export default function VerifyEmail() {
  const { userData, sendOtpVerification } = useAuth();
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [pendingData, setPendingData] = useState(null);
  const navigate = useNavigate();

  const pendingEmail = localStorage.getItem('pending_signup_email');

  // Load pending registration details on mount
  useEffect(() => {
    if (!pendingEmail) {
      navigate('/signup');
      return;
    }

    const loadPendingData = async () => {
      try {
        const pendingRef = doc(db, 'pending_registrations', pendingEmail);
        const pendingSnap = await getDoc(pendingRef);
        if (pendingSnap.exists()) {
          setPendingData(pendingSnap.data());
        } else {
          setError('No active verification session found. Please register again.');
        }
      } catch (err) {
        setError('Failed to retrieve verification details.');
      }
    };

    loadPendingData();
  }, [pendingEmail, navigate]);

  // Redirect instantly if email is already verified in user data profile
  useEffect(() => {
    if (userData?.isVerified) {
      navigate('/');
    }
  }, [userData, navigate]);

  // Handle countdown cooldown for resend button
  useEffect(() => {
    if (cooldown === 0) return;
    const intervalId = setInterval(() => {
      setCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [cooldown]);

  // Auto-submit OTP when 6 digits are filled
  useEffect(() => {
    const enteredCode = otp.join('');
    if (enteredCode.length === 6 && !loading) {
      verifyOtpCode(enteredCode);
    }
  }, [otp]);

  const handleChange = (value, index) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Focus next element if value entered
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Focus previous input if current is empty and clear it
        const prevInput = document.getElementById(`otp-${index - 1}`);
        if (prevInput) {
          prevInput.focus();
          const newOtp = [...otp];
          newOtp[index - 1] = '';
          setOtp(newOtp);
        }
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const verifyOtpCode = async (enteredCode) => {
    if (!pendingEmail) return;
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const pendingRef = doc(db, 'pending_registrations', pendingEmail);
      const pendingSnap = await getDoc(pendingRef);

      if (pendingSnap.exists()) {
        const data = pendingSnap.data();
        const otpData = data.otp;

        if (!otpData) {
          setError('No active verification session found. Please resend the verification code.');
        } else if (otpData.code !== enteredCode) {
          setError('Invalid verification code. Please check and try again.');
          setOtp(new Array(6).fill(''));
          setTimeout(() => {
            const firstInput = document.getElementById('otp-0');
            if (firstInput) firstInput.focus();
          }, 100);
        } else if (Date.now() > otpData.expiresAt) {
          setError('Verification code has expired. Please request a new code.');
        } else {
          // 1. Create the user in Firebase Authentication
          const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
          const user = userCredential.user;
          await updateProfile(user, { displayName: data.displayName });

          // 2. Create the official verified user profile in the users collection
          const userRef = doc(db, 'users', user.uid);
          await setDoc(userRef, {
            email: data.email,
            displayName: data.displayName,
            streak: 0,
            scores: [],
            badges: [],
            isVerified: true
          });

          // 3. Delete the temporary pending record
          await deleteDoc(pendingRef);
          
          // 4. Remove temporary email reference
          localStorage.removeItem('pending_signup_email');

          setMessage('Email verified successfully! Logging you in...');
          setTimeout(() => {
            navigate('/');
          }, 1200);
        }
      } else {
        setError('Verification session expired or already verified.');
      }
    } catch (err) {
      setError(getFriendlyAuthErrorMessage(err));
    }
    setLoading(false);
  };

  const handleResendEmail = async () => {
    if (cooldown > 0 || !pendingEmail || !pendingData) return;
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await sendOtpVerification(pendingEmail, pendingData.displayName);
      setMessage('A new 6-digit verification code has been sent to your email.');
      setCooldown(60); // 60 seconds cooldown
      setOtp(new Array(6).fill('')); // Clear inputs
      setTimeout(() => {
        const firstInput = document.getElementById('otp-0');
        if (firstInput) firstInput.focus();
      }, 100);
    } catch (err) {
      setError(getFriendlyAuthErrorMessage(err));
    }
    setLoading(false);
  };

  const handleCancel = () => {
    localStorage.removeItem('pending_signup_email');
    navigate('/signup');
  };

  return (
    <div className="premium-card slide-up" style={{ maxWidth: '480px', margin: '40px auto', padding: 'var(--spacing-large)' }}>
      <div className="auth-logo-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <svg className="auth-logo" viewBox="0 0 100 100" width="84" height="84" style={{ color: 'var(--primary-color)' }}>
          <rect x="15" y="25" width="70" height="50" rx="10" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          <path d="M 18 30 L 50 52 L 82 30" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="50" cy="72" r="10" fill="none" stroke="currentColor" strokeWidth="4" />
          <path d="M 47 72 L 53 72 M 50 69 L 50 75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      <h2 style={{ textAlign: 'center', fontSize: 'var(--font-size-xlarge)', marginBottom: '10px', color: 'var(--primary-color)' }}>Verify Your Email</h2>
      
      <p style={{ textAlign: 'center', fontSize: 'var(--font-size-base)', color: '#555', marginBottom: '20px', lineHeight: '1.6' }}>
        Please enter the 6-digit verification code sent to:
        <br />
        <strong style={{ color: 'var(--primary-color)', fontSize: '18px', display: 'inline-block', marginTop: '5px' }}>{pendingEmail}</strong>
      </p>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '25px 0' }}>
        {otp.map((data, index) => (
          <input
            key={index}
            id={`otp-${index}`}
            type="text"
            maxLength="1"
            value={data}
            onChange={e => handleChange(e.target.value, index)}
            onKeyDown={e => handleKeyDown(e, index)}
            onFocus={e => e.target.select()}
            style={{
              width: '45px',
              height: '55px',
              fontSize: '24px',
              textAlign: 'center',
              fontWeight: 'bold',
              border: '2px solid rgba(43, 103, 119, 0.2)',
              borderRadius: '10px',
              outline: 'none',
              backgroundColor: 'white',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
              transition: 'border-color 0.2s'
            }}
            onFocusCapture={(e) => {
              e.target.style.borderColor = 'var(--primary-color)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(43, 103, 119, 0.2)';
            }}
          />
        ))}
      </div>

      <p style={{ textAlign: 'center', fontSize: '14px', color: '#666', marginBottom: '25px' }}>
        The verification code expires in 15 minutes. Check your inbox and spam folders.
      </p>

      {error && <div className="error-message" style={{ marginBottom: '20px', padding: '12px', fontSize: '16px' }}>{error}</div>}
      {message && <div className="success-message" style={{ marginBottom: '20px', padding: '12px', fontSize: '16px' }}>{message}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <button 
          disabled={loading || cooldown > 0} 
          className="btn btn-secondary" 
          onClick={handleResendEmail}
          style={{ minHeight: 'var(--btn-min-height)', fontSize: 'var(--font-size-base)' }}
        >
          {cooldown > 0 ? `Resend Code in ${cooldown}s` : 'Resend Verification Code'}
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '18px' }}>
        <button 
          onClick={handleCancel} 
          style={{ background: 'none', border: 'none', color: '#d9534f', textDecoration: 'underline', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}
        >
          Cancel / Back to Sign Up
        </button>
      </div>
    </div>
  );
}
