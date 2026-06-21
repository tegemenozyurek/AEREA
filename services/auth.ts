import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type ActionCodeSettings,
  type User,
} from 'firebase/auth';
import { firebaseConfig, firebaseAuth } from '../lib/firebase';

/** Accounts created before this moment skip email verification (legacy users). */
export const EMAIL_VERIFICATION_REQUIRED_FROM = '2026-06-21T20:55:00+03:00';

export class EmailNotVerifiedError extends Error {
  code = 'auth/email-not-verified';

  constructor() {
    super('Email not verified');
    this.name = 'EmailNotVerifiedError';
  }
}

export function isEmailVerificationRequired(user: User): boolean {
  const createdAt = user.metadata.creationTime;
  if (!createdAt) return true;
  return new Date(createdAt).getTime() >= new Date(EMAIL_VERIFICATION_REQUIRED_FROM).getTime();
}

export function isEmailVerifiedForAccess(user: User): boolean {
  return user.emailVerified || !isEmailVerificationRequired(user);
}

/** Ensures Firebase emails use a proper https action link (%LINK% in Console template). */
export function getEmailVerificationActionCodeSettings(): ActionCodeSettings {
  return {
    url: `https://${firebaseConfig.authDomain}`,
    handleCodeInApp: false,
  };
}

function defaultDisplayName(email: string): string {
  const local = email.split('@')[0]?.trim();
  return local || 'AEREA user';
}

async function sendVerificationEmail(user: User): Promise<void> {
  if (!isEmailVerificationRequired(user)) {
    return;
  }
  await sendEmailVerification(user, getEmailVerificationActionCodeSettings());
}

export async function signUpWithEmail(email: string, password: string): Promise<void> {
  const credential = await createUserWithEmailAndPassword(
    firebaseAuth,
    email,
    password,
  );

  await updateProfile(credential.user, {
    displayName: defaultDisplayName(email),
  });
  await sendVerificationEmail(credential.user);
  await signOut(firebaseAuth);
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(
    firebaseAuth,
    email,
    password,
  );
  await reload(credential.user);

  if (!isEmailVerifiedForAccess(credential.user)) {
    await signOut(firebaseAuth);
    throw new EmailNotVerifiedError();
  }

  return credential.user;
}

export async function resendVerificationEmailForCredentials(
  email: string,
  password: string,
): Promise<void> {
  const credential = await signInWithEmailAndPassword(
    firebaseAuth,
    email,
    password,
  );

  if (!isEmailVerificationRequired(credential.user)) {
    await signOut(firebaseAuth);
    throw new Error('This account does not require email verification. You can sign in.');
  }

  if (credential.user.emailVerified) {
    await signOut(firebaseAuth);
    throw new Error('Email is already verified. You can sign in.');
  }

  await sendVerificationEmail(credential.user);
  await signOut(firebaseAuth);
}

export async function sendUserVerificationEmail(user?: User): Promise<void> {
  const target = user ?? firebaseAuth.currentUser;
  if (!target) {
    throw new Error('Not signed in');
  }
  await sendVerificationEmail(target);
}

export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(firebaseAuth, email.trim());
}

export async function reloadCurrentUser(): Promise<User | null> {
  const user = firebaseAuth.currentUser;
  if (!user) return null;
  await reload(user);
  return firebaseAuth.currentUser;
}

export async function signOutUser(): Promise<void> {
  await signOut(firebaseAuth);
}

export function subscribeToAuthState(
  callback: (user: User | null) => void,
): () => void {
  return onAuthStateChanged(firebaseAuth, callback);
}

export function getCurrentUser(): User | null {
  return firebaseAuth.currentUser;
}

export async function updateUserDisplayName(displayName: string): Promise<void> {
  const user = firebaseAuth.currentUser;
  if (!user) {
    throw new Error('Not signed in');
  }

  await updateProfile(user, { displayName: displayName.trim() });
}
