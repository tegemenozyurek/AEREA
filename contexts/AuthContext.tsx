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
  reloadCurrentUser,
  resendVerificationEmailForCredentials,
  sendPasswordReset,
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
  authReady: boolean;
  isAuthenticated: boolean;
  pendingVerification: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (email: string, password: string) => Promise<AuthResult>;
  resendVerificationEmail: (email: string, password: string) => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  refreshEmailVerification: () => Promise<AuthResult>;
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

async function syncUserFromFirebase(): Promise<User | null> {
  return reloadCurrentUser();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
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

          if (!firebaseUser.emailVerified) {
            await signOutUser();
            setUser(null);
          } else {
            setUser(firebaseUser);
          }
        } else {
          setUser(null);
        }

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
      setAuthTick((tick) => tick + 1);
      return { ok: true };
    } catch (e) {
      setUser(null);
      return toAuthError(e);
    }
  }, []);

  const register = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      await signUpWithEmail(email.trim(), password);
      setUser(null);
      return { ok: true };
    } catch (e) {
      return toAuthError(e);
    }
  }, []);

  const resendVerificationEmail = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      try {
        await resendVerificationEmailForCredentials(email.trim(), password);
        return { ok: true };
      } catch (e) {
        return toAuthError(e);
      }
    },
    [],
  );

  const resetPassword = useCallback(async (email: string): Promise<AuthResult> => {
    try {
      await sendPasswordReset(email.trim());
      return { ok: true };
    } catch (e) {
      return toAuthError(e);
    }
  }, []);

  const refreshEmailVerification = useCallback(async (): Promise<AuthResult> => {
    try {
      const refreshed = await syncUserFromFirebase();
      if (!refreshed) {
        return { ok: false, error: 'Not signed in.' };
      }
      if (!refreshed.emailVerified) {
        await signOutUser();
        setUser(null);
        return { ok: false, error: 'Email not verified yet. Check your inbox.' };
      }
      setUser(refreshed);
      setAuthTick((tick) => tick + 1);
      return { ok: true };
    } catch (e) {
      return toAuthError(e);
    }
  }, []);

  const logout = useCallback(async () => {
    await signOutUser();
    setUser(null);
  }, []);

  const isAuthenticated = Boolean(user?.emailVerified);
  const pendingVerification = false;

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      authReady,
      isAuthenticated,
      pendingVerification,
      login,
      register,
      resendVerificationEmail,
      resetPassword,
      refreshEmailVerification,
      logout,
    }),
    [
      user,
      authReady,
      authTick,
      isAuthenticated,
      login,
      register,
      resendVerificationEmail,
      resetPassword,
      refreshEmailVerification,
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
