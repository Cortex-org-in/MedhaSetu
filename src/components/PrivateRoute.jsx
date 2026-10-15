import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import Mascot from './Mascot';

export default function PrivateRoute({ children }) {
  const { currentUser, userData, isGuest, logout } = useAuth();
  const [timedOut, setTimedOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setTimedOut(false);
    if (!userData) {
      const timer = setTimeout(() => {
        setTimedOut(true);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [userData]);

  async function handleSignOut() {
    try {
      await logout();
    } catch (err) {
      console.error('Sign out failed:', err);
    }
    navigate('/login');
  }

  if (!currentUser && !isGuest) {
    return <Navigate to="/login" />;
  }

  // Wait for Firestore user profile metadata to load to prevent false redirects
  if (!userData) {
    if (timedOut) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', width: '100%', padding: '24px', textAlign: 'center' }}>
          <Mascot state="wave" width="160" height="160" />
          <h2 style={{ marginTop: '16px' }}>Profile not found</h2>
          <p style={{ color: '#555', marginBottom: '16px' }}>
            We could not load your profile. It may not exist yet or there may be a connection issue.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn" onClick={() => window.location.reload()}>
              Retry
            </button>
            <button className="btn btn-secondary" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', width: '100%' }}>
        <Mascot state="loading" width="240" height="240" />
      </div>
    );
  }

  // If email verification flag is not true, redirect to VerifyEmail page
  if (userData.isVerified !== true) {
    return <Navigate to="/verify-email" />;
  }

  return children;
}
