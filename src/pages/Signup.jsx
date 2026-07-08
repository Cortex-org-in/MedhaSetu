import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { getFriendlyAuthErrorMessage } from '../utils/authErrorTranslator';

export default function Signup() {
  const nameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const { currentUser, signup, loginWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      await signup(emailRef.current.value, passwordRef.current.value, nameRef.current.value);
    } catch (err) {
      setError(getFriendlyAuthErrorMessage(err));
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
    } catch (err) {
      setError(getFriendlyAuthErrorMessage(err));
      setLoading(false);
    }
  }

  return (
    <div className="premium-card slide-up">
      {/* Visual SVG Logo */}
      <div className="auth-logo-container">
        <svg className="auth-logo" viewBox="0 0 100 100" width="84" height="84">
          <path fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" 
            d="M 50 15 C 30 15 25 35 35 48 C 30 55 35 70 45 70 C 48 70 50 67 50 67 C 50 67 52 70 55 70 C 65 70 70 55 65 48 C 75 35 70 15 50 15 Z" />
          <path fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"
            d="M 50 25 L 50 55 M 38 35 C 44 38 48 42 50 48 M 62 35 C 56 38 52 42 50 48" />
          <circle cx="50" cy="15" r="4" fill="currentColor" />
          <circle cx="35" cy="48" r="4" fill="currentColor" />
          <circle cx="65" cy="48" r="4" fill="currentColor" />
        </svg>
      </div>

      <h2 style={{ textAlign: 'center', fontSize: '32px', marginBottom: '10px', color: 'var(--primary-color)' }}>Create an Account</h2>
      <p style={{ textAlign: 'center', fontSize: '18px', color: '#555', marginBottom: '25px', padding: '0 10px' }}>
        Join us and train your memory, logic, and general knowledge with custom brain training quizes daily.
      </p>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="name">Full Name</label>
          <input type="text" id="name" ref={nameRef} placeholder="Your name" required />
        </div>
        <div className="input-group">
          <label htmlFor="email">Email Address</label>
          <input type="email" id="email" ref={emailRef} placeholder="name@example.com" required />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password (at least 6 characters)</label>
          <input type="password" id="password" ref={passwordRef} placeholder="••••••••" required minLength="6" />
        </div>
        <div className="input-group">
          <label htmlFor="password-confirm">Confirm Password</label>
          <input type="password" id="password-confirm" ref={passwordConfirmRef} placeholder="••••••••" required minLength="6" />
        </div>
        <button disabled={loading} className="btn" type="submit" style={{ marginTop: '10px' }}>
          Sign Up with Email
        </button>
      </form>
      
      <div style={{ textAlign: 'center', margin: '20px 0', fontSize: '20px', fontWeight: '500', color: '#777' }}>OR</div>
      
      <button disabled={loading} className="btn btn-secondary" onClick={handleGoogleLogin}>
        Sign Up with Google
      </button>

      <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '20px' }}>
        Already have an account? <Link style={{color: 'var(--primary-color)', textDecoration: 'underline', fontWeight: 'bold'}} to="/login">Sign In Here</Link>
      </div>
    </div>
  );
}
