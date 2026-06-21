import { applyActionCode } from 'firebase/auth';
import { firebaseAuth } from '../lib/firebase';

export type AuthActionLink = {
  mode: string;
  oobCode: string;
};

/** Parse Firebase auth action links from email / deep links. */
export function parseAuthActionLink(url: string): AuthActionLink | null {
  try {
    const parsed = new URL(url);
    const mode = parsed.searchParams.get('mode');
    const oobCode = parsed.searchParams.get('oobCode');
    if (mode && oobCode) {
      return { mode, oobCode };
    }
  } catch {
    // Fall through to regex parsing for malformed URLs.
  }

  const modeMatch = url.match(/[?&]mode=([^&]+)/);
  const codeMatch = url.match(/[?&]oobCode=([^&]+)/);
  if (modeMatch?.[1] && codeMatch?.[1]) {
    return {
      mode: decodeURIComponent(modeMatch[1]),
      oobCode: decodeURIComponent(codeMatch[1]),
    };
  }

  return null;
}

export async function completeEmailVerificationFromLink(url: string): Promise<boolean> {
  const action = parseAuthActionLink(url);
  if (!action || action.mode !== 'verifyEmail') {
    return false;
  }

  await applyActionCode(firebaseAuth, action.oobCode);
  return true;
}
