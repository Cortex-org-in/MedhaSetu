import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getFriendlyAuthErrorMessage } from '../utils/authErrorTranslator';
import { auth } from '../firebase';

export default function VerifyEmail() {
  const { currentUser, sendVerification, logout } = useAuth();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();

  // Redirect instantly if email is already verified
  useEffect(() => {
    if (currentUser?.emailVerified) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  // Handle countdown cooldown for resend button
  useEffect(() => {
    if (cooldown === 0) return;
    const intervalId = setInterval(() => {
      setCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [cooldown]);

  const handleCheckVerification = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          setMessage('Email verified successfully! Redirecting...');
          setTimeout(() => {
            navigate('/');
          }, 1500);
        } else {
          setError('Email not verified yet. Please check your inbox or spam folders.');
        }
      } else {
        setError('No active user session found. Please sign in again.');
      }
    } catch (err) {
      setError(getFriendlyAuthErrorMessage(err));
    }
    setLoading(false);
  };

  const handleResendEmail = async () => {
    if (cooldown > 0) return;
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await sendVerification();
      setMessage('Verification link sent! Check your inbox.');
      setCooldown(60); // 60 seconds cooldown
    } catch (err) {
      setError(getFriendlyAuthErrorMessage(err));
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setError('Failed to sign out. Please refresh the page.');
    }
  };

  return (
    <div className="premium-card slide-up" style={{ maxWidth: '480px', margin: '40px auto', padding: 'var(--spacing-large)' }}>
      {/* Verification Mail Icon SVG */}
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
        We have sent a verification link to your email address:
        <br />
        <strong style={{ color: 'var(--primary-color)', fontSize: '18px', display: 'inline-block', marginTop: '5px' }}>{currentUser?.email}</strong>
      </p>
      
      <p style={{ textAlign: 'center', fontSize: '14px', color: '#666', marginBottom: '25px' }}>
        Please click the link inside that email to activate your MedhaSetu account. If you do not see it, please check your spam folder.
      </p>

      {error && <div className="error-message" style={{ marginBottom: '20px', padding: '12px', fontSize: '16px' }}>{error}</div>}
      {message && <div className="success-message" style={{ marginBottom: '20px', padding: '12px', fontSize: '16px' }}>{message}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <button 
          disabled={loading} 
          className="btn" 
          onClick={handleCheckVerification}
          style={{ minHeight: 'var(--btn-min-height)', fontSize: 'var(--font-size-base)' }}
        >
          {loading ? 'Checking...' : 'I Have Verified My Email'}
        </button>

        <button 
          disabled={loading || cooldown > 0} 
          className="btn btn-secondary" 
          onClick={handleResendEmail}
          style={{ minHeight: 'var(--btn-min-height)', fontSize: 'var(--font-size-base)' }}
        >
          {cooldown > 0 ? `Resend Email in ${cooldown}s` : 'Resend Verification Email'}
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '18px' }}>
        <button 
          onClick={handleLogout} 
          style={{ background: 'none', border: 'none', color: '#d9534f', textDecoration: 'underline', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}
        >
          Log Out / Back to Login
        </button>
      </div>
    </div>
  );
}
