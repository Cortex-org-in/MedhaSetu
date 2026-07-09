import React, { useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { getFriendlyAuthErrorMessage } from '../utils/authErrorTranslator';
import Mascot from '../components/Mascot';

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
      {/* Visual Mascot Logo */}
      <div className="auth-logo-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
        <Mascot state="wave" width="120" height="120" />
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
