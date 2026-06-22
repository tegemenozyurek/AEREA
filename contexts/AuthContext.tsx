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
  sendPasswordReset,
  sendUserVerificationEmail,
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
  subscribeToAuthState,
} from '../services/auth';
import { getFirebaseAuthErrorCode, getFirebaseAuthErrorMessage } from '../services/authErrors';

export type AuthResult =
  | { ok: true }
  | { ok: false; error: string; code?: string };

type AuthContextValue = {
  user: User | null;
  verificationUser: User | null;
  authReady: boolean;
  isAuthenticated: boolean;
  pendingVerification: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (email: string, password: string) => Promise<AuthResult>;
  resendVerificationEmail: () => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<AuthResult>;
  refreshEmailVerification: () => Promise<AuthResult>;
  cancelVerification: () => Promise<AuthResult>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function toAuthError(e: unknown): { ok: false; error: string; code?: string } {
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
      })();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      const signedIn = await signInWithEmail(email.trim(), password);
      setUser(signedIn);
      setVerificationUser(null);
      setAuthTick((tick) => tick + 1);
      return { ok: true };
    } catch (e) {
      const code = getFirebaseAuthErrorCode(e);
      if (code === 'auth/email-not-verified') {
        const pending = await reloadCurrentUser();
        if (pending && isEmailVerificationRequired(pending) && !pending.emailVerified) {
          setVerificationUser(pending);
          setUser(null);
          setAuthTick((tick) => tick + 1);
        }
        return toAuthError(e);
      }
      setUser(null);
      setVerificationUser(null);
      return toAuthError(e);
    }
  }, []);

  const register = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      await signUpWithEmail(email.trim(), password);
      const pending = await reloadCurrentUser();
      if (pending && isEmailVerificationRequired(pending) && !pending.emailVerified) {
        setVerificationUser(pending);
        setUser(null);
      }
      setAuthTick((tick) => tick + 1);
      return { ok: true };
    } catch (e) {
      return toAuthError(e);
    }
  }, []);

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
      return { ok: true };
    } catch (e) {
      return toAuthError(e);
    }
  }, []);

  const cancelVerification = useCallback(async (): Promise<AuthResult> => {
    try {
      if (verificationUser) {
        await cancelPendingVerification(verificationUser);
      } else {
        await signOutUser();
      }
      setUser(null);
      setVerificationUser(null);
      setAuthTick((tick) => tick + 1);
      return { ok: true };
    } catch (e) {
      return toAuthError(e);
    }
  }, [verificationUser]);

  const logout = useCallback(async () => {
    await signOutUser();
    setUser(null);
    setVerificationUser(null);
  }, []);

  const isAuthenticated = Boolean(user);
  const pendingVerification = Boolean(verificationUser);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      verificationUser,
      authReady,
      isAuthenticated,
      pendingVerification,
      login,
      register,
      resendVerificationEmail,
      resetPassword,
      changePassword: changePasswordHandler,
      refreshEmailVerification,
      cancelVerification,
      logout,
    }),
    [
      user,
      verificationUser,
      authReady,
      authTick,
      isAuthenticated,
      pendingVerification,
      login,
      register,
      resendVerificationEmail,
      resetPassword,
      changePasswordHandler,
      refreshEmailVerification,
      cancelVerification,
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
