import React, { useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { getFriendlyAuthErrorMessage } from '../utils/authErrorTranslator';

export default function ForgotPassword() {
  const emailRef = useRef();
  const { resetPassword } = useAuth();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setMessage('');
      setError('');
      setLoading(true);
      await resetPassword(emailRef.current.value);
      setMessage('Check your inbox for password reset instructions');
    } catch (err) {
      setError(getFriendlyAuthErrorMessage(err));
    }
    setLoading(false);
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

      <h2 style={{ textAlign: 'center', fontSize: '32px', marginBottom: '10px', color: 'var(--primary-color)' }}>Password Reset</h2>
      <p style={{ textAlign: 'center', fontSize: '18px', color: '#555', marginBottom: '25px', padding: '0 10px' }}>
        Enter your registered email address to receive password reset instructions.
      </p>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="email">Email Address</label>
          <input type="email" id="email" ref={emailRef} placeholder="name@example.com" required />
        </div>
        <button disabled={loading} className="btn" type="submit" style={{ marginTop: '10px' }}>
          Reset Password
        </button>
      </form>
      
      <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '20px' }}>
        <Link style={{color: 'var(--primary-color)', textDecoration: 'underline', fontWeight: 'bold'}} to="/login">Back to Sign In</Link>
      </div>
    </div>
  );
}
