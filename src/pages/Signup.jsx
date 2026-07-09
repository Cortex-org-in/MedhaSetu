import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { getFriendlyAuthErrorMessage } from '../utils/authErrorTranslator';
import Mascot from '../components/Mascot';

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
      navigate('/verify-email');
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
      {/* Visual Mascot Logo */}
      <div className="auth-logo-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
        <Mascot state="wave" width="120" height="120" />
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
