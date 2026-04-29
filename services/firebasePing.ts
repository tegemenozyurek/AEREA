import { signInWithEmail, signOutUser, signUpWithEmail } from './auth';

const TEST_EMAIL = 'ping@aerea.app';
const TEST_PASSWORD = 'PingTest1234!';

const SIGNIN_NOT_FOUND_CODES = new Set([
  'auth/user-not-found',
  'auth/invalid-credential',
  'auth/invalid-login-credentials',
  'auth/wrong-password',
]);

export type PingResult = {
  ok: boolean;
  message: string;
};

/**
 * Verifies the Firebase Auth backend is reachable and configured.
 *
 * Tries to sign in with a fixed test account; if the account doesn't exist
 * yet, it creates it on the fly. Either way, it signs out afterwards so the
 * app's local auth state is not affected.
 *
 * Intended to be called once during app start in development only.
 */
export async function pingFirebaseAuth(): Promise<PingResult> {
  try {
    const user = await signInWithEmail(TEST_EMAIL, TEST_PASSWORD);
    await signOutUser();
    return {
      ok: true,
      message: `Sign-in OK as ${user.email} (uid=${user.uid})`,
    };
  } catch (signInErr) {
    const code = (signInErr as { code?: string } | null)?.code ?? 'unknown';

    if (!SIGNIN_NOT_FOUND_CODES.has(code)) {
      return {
        ok: false,
        message: `Sign-in failed: ${code} — ${formatError(signInErr)}`,
      };
    }

    try {
      const user = await signUpWithEmail(TEST_EMAIL, TEST_PASSWORD);
      await signOutUser();
      return {
        ok: true,
        message: `Created test user ${user.email} (uid=${user.uid})`,
      };
    } catch (signUpErr) {
      const upCode = (signUpErr as { code?: string } | null)?.code ?? 'unknown';
      return {
        ok: false,
        message: `Sign-up failed: ${upCode} — ${formatError(signUpErr)}`,
      };
    }
  }
}

function formatError(e: unknown): string {
  if (e && typeof e === 'object' && 'message' in e) {
    return String((e as { message?: unknown }).message);
  }
  return String(e);
}
