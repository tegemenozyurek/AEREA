import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { firebaseAuth } from '../lib/firebase';

export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(
    firebaseAuth,
    email,
    password,
  );
  return credential.user;
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<User> {
  const credential = await signInWithEmailAndPassword(
    firebaseAuth,
    email,
    password,
  );
  return credential.user;
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
