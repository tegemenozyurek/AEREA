export function getFirebaseAuthErrorCode(error: unknown): string {
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    typeof (error as { code?: unknown }).code === 'string'
  ) {
    return (error as { code: string }).code;
  }
  return '';
}

export function getFirebaseAuthErrorMessage(error: unknown): string {
  const code = getFirebaseAuthErrorCode(error);

  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/weak-password':
      return 'Password is too weak. Use a stronger password.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/requires-recent-login':
      return 'For security, enter your current password and try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again later.';
    case 'auth/invalid-new-email':
      return 'Invalid email address.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled. Contact support.';
    case 'auth/email-not-verified':
      return 'Please verify your email before signing in. Check your inbox.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email using a different sign-in method.';
    case 'auth/popup-closed-by-user':
    case 'ERR_REQUEST_CANCELED':
      return 'Google sign-in was cancelled.';
    default:
      if (error instanceof Error && error.message) {
        return error.message;
      }
      return 'Something went wrong. Please try again.';
  }
}
