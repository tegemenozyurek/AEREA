import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { User } from 'firebase/auth';
import { reload } from 'firebase/auth';
import {
  cancelPendingVerification,
  changePassword,
  isEmailVerifiedForAccess,
  isEmailVerificationRequired,
  reloadCurrentUser,
  requestEmailChange,
  sendPasswordReset,
  sendUserVerificationEmail,
  signInWithEmail,
  signInWithGoogleIdToken,
  signOutUser,
  signUpWithEmail,
  subscribeToAuthState,
} from '../services/auth';
import { getFirebaseAuthErrorCode, getFirebaseAuthErrorMessage } from '../services/authErrors';
import {
  claimUsername,
  ensureUserDocument,
  UsernameTakenError,
} from '../services/users';

export type AuthResult =
  | { ok: true }
  | { ok: false; error: string; code?: string };

type AuthContextValue = {
  user: User | null;
  verificationUser: User | null;
  authReady: boolean;
  isAuthenticated: boolean;
  pendingVerification: boolean;
  /** True once Firestore users/{uid} has been loaded/created for the session user. */
  userDocReady: boolean;
  /** Authenticated but still needs to pick a unique username. */
  needsUsernameSetup: boolean;
  firestoreUsername: string | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  loginWithGoogle: (idToken: string) => Promise<AuthResult>;
  register: (email: string, password: string) => Promise<AuthResult>;
  resendVerificationEmail: () => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<AuthResult>;
  requestEmailChange: (newEmail: string, currentPassword: string) => Promise<AuthResult>;
  refreshEmailVerification: () => Promise<AuthResult>;
  cancelVerification: () => Promise<AuthResult>;
  completeUsernameSetup: (username: string) => Promise<AuthResult>;
  setFirestoreUsername: (username: string) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function toAuthError(e: unknown): { ok: false; error: string; code?: string } {
  if (e instanceof UsernameTakenError) {
    return { ok: false, error: e.message, code: e.code };
  }
  if (e instanceof Error && e.message) {
    const code = getFirebaseAuthErrorCode(e);
    if (code) {
      return { ok: false, error: getFirebaseAuthErrorMessage(e), code };
    }
    return { ok: false, error: e.message };
  }
  return {
    ok: false,
    error: getFirebaseAuthErrorMessage(e),
    code: getFirebaseAuthErrorCode(e) || undefined,
  };
}

function splitAuthUser(firebaseUser: User | null): {
  user: User | null;
  verificationUser: User | null;
} {
  if (!firebaseUser) {
    return { user: null, verificationUser: null };
  }

  if (isEmailVerifiedForAccess(firebaseUser)) {
    return { user: firebaseUser, verificationUser: null };
  }

  if (isEmailVerificationRequired(firebaseUser)) {
    return { user: null, verificationUser: firebaseUser };
  }

  return { user: firebaseUser, verificationUser: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [verificationUser, setVerificationUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authTick, setAuthTick] = useState(0);
  const [userDocReady, setUserDocReady] = useState(false);
  const [needsUsernameSetup, setNeedsUsernameSetup] = useState(false);
  const [firestoreUsername, setFirestoreUsernameState] = useState<string | null>(null);

  const resetUserDocState = useCallback(() => {
    setUserDocReady(false);
    setNeedsUsernameSetup(false);
    setFirestoreUsernameState(null);
  }, []);

  const syncUserDocument = useCallback(async (firebaseUser: User) => {
    setUserDocReady(false);
    try {
      const doc = await ensureUserDocument(firebaseUser);
      setFirestoreUsernameState(doc.username);
      setNeedsUsernameSetup(!doc.username);
      setUserDocReady(true);
    } catch {
      // Fail closed: keep the user on a setup/retry path rather than entering the app
      // without a users/{uid} document.
      setFirestoreUsernameState(null);
      setNeedsUsernameSetup(true);
      setUserDocReady(true);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const unsubscribe = subscribeToAuthState((firebaseUser) => {
      void (async () => {
        if (!active) return;

        if (firebaseUser) {
          try {
            await reload(firebaseUser);
          } catch {
            // Keep cached user if reload fails offline.
          }
        }

        const next = splitAuthUser(firebaseUser);
        setUser(next.user);
        setVerificationUser(next.verificationUser);
        setAuthReady(true);

        if (next.user) {
          await syncUserDocument(next.user);
        } else {
          resetUserDocState();
          setUserDocReady(true);
        }
      })();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [resetUserDocState, syncUserDocument]);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      const signedIn = await signInWithEmail(email.trim(), password);
      setUser(signedIn);
      setVerificationUser(null);
      setAuthTick((tick) => tick + 1);
      await syncUserDocument(signedIn);
      return { ok: true };
    } catch (e) {
      const code = getFirebaseAuthErrorCode(e);
      if (code === 'auth/email-not-verified') {
        const pending = await reloadCurrentUser();
        if (pending && isEmailVerificationRequired(pending) && !pending.emailVerified) {
          setVerificationUser(pending);
          setUser(null);
          resetUserDocState();
          setUserDocReady(true);
          setAuthTick((tick) => tick + 1);
        }
        return toAuthError(e);
      }
      setUser(null);
      setVerificationUser(null);
      resetUserDocState();
      setUserDocReady(true);
      return toAuthError(e);
    }
  }, [resetUserDocState, syncUserDocument]);

  const loginWithGoogle = useCallback(async (idToken: string): Promise<AuthResult> => {
    try {
      const signedIn = await signInWithGoogleIdToken(idToken);
      setUser(signedIn);
      setVerificationUser(null);
      setAuthTick((tick) => tick + 1);
      await syncUserDocument(signedIn);
      return { ok: true };
    } catch (e) {
      setUser(null);
      setVerificationUser(null);
      resetUserDocState();
      setUserDocReady(true);
      return toAuthError(e);
    }
  }, [resetUserDocState, syncUserDocument]);

  const register = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      await signUpWithEmail(email.trim(), password);
      const pending = await reloadCurrentUser();
      if (pending && isEmailVerificationRequired(pending) && !pending.emailVerified) {
        setVerificationUser(pending);
        setUser(null);
        resetUserDocState();
        setUserDocReady(true);
      } else if (pending && isEmailVerifiedForAccess(pending)) {
        // Legacy / exempt accounts skip verification — still create users/{uid}.
        setUser(pending);
        setVerificationUser(null);
        await syncUserDocument(pending);
      }
      setAuthTick((tick) => tick + 1);
      return { ok: true };
    } catch (e) {
      return toAuthError(e);
    }
  }, [resetUserDocState, syncUserDocument]);

  const resendVerificationEmail = useCallback(async (): Promise<AuthResult> => {
    try {
      if (verificationUser) {
        await sendUserVerificationEmail(verificationUser);
        return { ok: true };
      }
      return { ok: false, error: 'No pending verification session.' };
    } catch (e) {
      return toAuthError(e);
    }
  }, [verificationUser]);

  const resetPassword = useCallback(async (email: string): Promise<AuthResult> => {
    try {
      await sendPasswordReset(email.trim());
      return { ok: true };
    } catch (e) {
      return toAuthError(e);
    }
  }, []);

  const changePasswordHandler = useCallback(
    async (currentPassword: string, newPassword: string): Promise<AuthResult> => {
      try {
        await changePassword(currentPassword, newPassword);
        return { ok: true };
      } catch (e) {
        return toAuthError(e);
      }
    },
    [],
  );

  const requestEmailChangeHandler = useCallback(
    async (newEmail: string, currentPassword: string): Promise<AuthResult> => {
      try {
        await requestEmailChange(newEmail, currentPassword);
        return { ok: true };
      } catch (e) {
        return toAuthError(e);
      }
    },
    [],
  );

  const setFirestoreUsername = useCallback((username: string) => {
    setFirestoreUsernameState(username);
    setNeedsUsernameSetup(!username);
  }, []);

  const refreshEmailVerification = useCallback(async (): Promise<AuthResult> => {
    try {
      const refreshed = await reloadCurrentUser();
      if (!refreshed) {
        return { ok: false, error: 'No pending verification session.' };
      }
      if (!isEmailVerifiedForAccess(refreshed)) {
        return { ok: false, error: 'Email not verified yet. Check your inbox and spam.' };
      }
      setUser(refreshed);
      setVerificationUser(null);
      setAuthTick((tick) => tick + 1);
      await syncUserDocument(refreshed);
      return { ok: true };
    } catch (e) {
      return toAuthError(e);
    }
  }, [syncUserDocument]);

  const cancelVerification = useCallback(async (): Promise<AuthResult> => {
    try {
      if (verificationUser) {
        await cancelPendingVerification(verificationUser);
      } else {
        await signOutUser();
      }
      setUser(null);
      setVerificationUser(null);
      resetUserDocState();
      setUserDocReady(true);
      setAuthTick((tick) => tick + 1);
      return { ok: true };
    } catch (e) {
      return toAuthError(e);
    }
  }, [resetUserDocState, verificationUser]);

  const completeUsernameSetup = useCallback(
    async (username: string): Promise<AuthResult> => {
      if (!user?.uid) {
        return { ok: false, error: 'You must be signed in.' };
      }
      try {
        const saved = await claimUsername(user.uid, username);
        setFirestoreUsername(saved);
        setNeedsUsernameSetup(false);
        setAuthTick((tick) => tick + 1);
        return { ok: true };
      } catch (e) {
        return toAuthError(e);
      }
    },
    [user?.uid],
  );

  const logout = useCallback(async () => {
    await signOutUser();
    setUser(null);
    setVerificationUser(null);
    resetUserDocState();
    setUserDocReady(true);
  }, [resetUserDocState]);

  const isAuthenticated = Boolean(user);
  const pendingVerification = Boolean(verificationUser);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      verificationUser,
      authReady,
      isAuthenticated,
      pendingVerification,
      userDocReady,
      needsUsernameSetup,
      firestoreUsername,
      login,
      loginWithGoogle,
      register,
      resendVerificationEmail,
      resetPassword,
      changePassword: changePasswordHandler,
      requestEmailChange: requestEmailChangeHandler,
      refreshEmailVerification,
      cancelVerification,
      completeUsernameSetup,
      setFirestoreUsername,
      logout,
    }),
    [
      user,
      verificationUser,
      authReady,
      authTick,
      isAuthenticated,
      pendingVerification,
      userDocReady,
      needsUsernameSetup,
      firestoreUsername,
      login,
      loginWithGoogle,
      register,
      resendVerificationEmail,
      resetPassword,
      changePasswordHandler,
      requestEmailChangeHandler,
      refreshEmailVerification,
      cancelVerification,
      completeUsernameSetup,
      setFirestoreUsername,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
