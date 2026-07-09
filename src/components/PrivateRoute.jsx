import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PrivateRoute({ children }) {
  const { currentUser, userData } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Wait for Firestore user profile metadata to load to prevent false redirects
  if (!userData) {
    return <div style={{ padding: '40px', textAlign: 'center', fontSize: 'var(--font-size-large)', color: 'var(--primary-color)' }}>Loading profile...</div>;
  }

  // If email verification flag is explicitly set to false, redirect to VerifyEmail page
  if (userData.isVerified === false) {
    return <Navigate to="/verify-email" />;
  }

  return children;
}
