import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import Mascot from './Mascot';

export default function PrivateRoute({ children }) {
  const { currentUser, userData } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Wait for Firestore user profile metadata to load to prevent false redirects
  if (!userData) {
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
