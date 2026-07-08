import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PrivateRoute({ children }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Detect email/password login and enforce verification check
  const isEmailPasswordUser = currentUser.providerData.some(
    (profile) => profile.providerId === 'password'
  );

  if (isEmailPasswordUser && !currentUser.emailVerified) {
    return <Navigate to="/verify-email" />;
  }

  return children;
}
