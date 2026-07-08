/**
 * Translates standard Firebase Authentication error codes into friendly, 
 * clear, and senior-accessible messages, avoiding technical jargon.
 * 
 * @param {Object} error - The caught error object from Firebase.
 * @returns {string} - A user-friendly error message.
 */
export function getFriendlyAuthErrorMessage(error) {
  if (!error) return 'An unexpected error occurred. Please try again.';
  
  const code = error.code;
  console.log("Firebase Auth Error caught:", code, error.message);

  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email address is already registered. If you already have an account, please try signing in or resetting your password.';
    case 'auth/invalid-email':
      return 'The email address you entered does not look correct. Please verify it (e.g. name@example.com) and try again.';
    case 'auth/user-disabled':
      return 'This account has been temporarily disabled. Please contact our support team for help.';
    case 'auth/user-not-found':
      return 'We could not find an account with this email address. Please check your spelling or sign up to create a new account.';
    case 'auth/wrong-password':
      return 'The password you entered is incorrect. Please try again or click "Forgot Password" to reset it.';
    case 'auth/invalid-credential':
      return 'Incorrect email address or password. Please double-check your spelling and try again.';
    case 'auth/weak-password':
      return 'For security, your password must be at least 6 characters long. Please try a stronger password.';
    case 'auth/popup-blocked':
      return 'The Google login window was blocked by your browser. Please allow popups for this website in your browser settings, then click "Sign In with Google" again.';
    case 'auth/popup-closed-by-user':
      return 'The Google sign-in window was closed before it finished. Please click the button and try again.';
    case 'auth/cancelled-popup-request':
      return 'The sign-in process was cancelled. Please try again.';
    case 'auth/network-request-failed':
      return 'We are having trouble connecting to the internet. Please check your Wi-Fi or cellular connection and try again.';
    case 'auth/unauthorized-domain':
      return 'This website domain is not authorized for Google login. Admin action: Add this domain (seniorsetu-agility.web.app) in your Firebase Console under Auth settings.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts have occurred. Your account is temporarily locked to keep it safe. Please wait a few minutes and try again.';
    case 'auth/requires-recent-login':
      return 'For your security, please sign out and sign in again before completing this action.';
    case 'auth/internal-error':
      return 'A technical error occurred in the system. Please wait a moment and try again.';
    default:
      if (error.message && error.message.toLowerCase().includes('network')) {
        return 'Network issue detected. Please check your internet connection.';
      }
      return 'Could not complete the action. Please check your entries and try again.';
  }
}
