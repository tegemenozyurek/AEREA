import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  type Timestamp,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { firestore } from '../lib/firebase';
import { updateUserDisplayName } from './auth';

export const USERS_COLLECTION = 'users';

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;
/** Lowercase Latin letters and underscore only — no spaces, digits, uppercase, or Turkish chars. */
export const USERNAME_PATTERN = /^[a-z_]+$/;

export const BIO_MAX = 300;

export type FirestoreUser = {
  uid: string;
  email: string | null;
  username: string | null;
  bio: string | null;
  photoURL: string | null;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
};

export class UsernameTakenError extends Error {
  code = 'username-taken';

  constructor() {
    super('That username is already taken.');
    this.name = 'UsernameTakenError';
  }
}

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function validateUsernameFormat(raw: string): string | null {
  const username = normalizeUsername(raw);
  if (!username) {
    return 'Username is required.';
  }
  if (/\s/.test(raw)) {
    return 'Spaces are not allowed.';
  }
  if (username.length < USERNAME_MIN) {
    return `Username must be at least ${USERNAME_MIN} characters.`;
  }
  if (username.length > USERNAME_MAX) {
    return `Username must be ${USERNAME_MAX} characters or less.`;
  }
  if (!USERNAME_PATTERN.test(username)) {
    return 'Use only lowercase letters (a–z) and underscores. No numbers or uppercase.';
  }
  return null;
}

function userRef(uid: string) {
  return doc(firestore, USERS_COLLECTION, uid);
}

function parseUserDoc(uid: string, data: Record<string, unknown>): FirestoreUser {
  const username = typeof data.username === 'string' ? data.username.trim() : null;
  const bio = typeof data.bio === 'string' ? data.bio.trim() : null;

  return {
    uid,
    email: typeof data.email === 'string' ? data.email : null,
    username: username || null,
    bio: bio || null,
    photoURL: typeof data.photoURL === 'string' ? data.photoURL : null,
    createdAt: (data.createdAt as Timestamp | undefined) ?? null,
    updatedAt: (data.updatedAt as Timestamp | undefined) ?? null,
  };
}

export async function getUserDocument(uid: string): Promise<FirestoreUser | null> {
  const snap = await getDoc(userRef(uid));
  if (!snap.exists()) {
    return null;
  }
  return parseUserDoc(uid, snap.data() as Record<string, unknown>);
}

/** Create users/{uid} if missing. Does not invent a username. */
export async function ensureUserDocument(user: User): Promise<FirestoreUser> {
  const ref = userRef(user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const existing = parseUserDoc(user.uid, snap.data() as Record<string, unknown>);
    // Keep email/photo fresh; drop legacy usernameLower if present.
    await setDoc(
      ref,
      {
        email: user.email ?? existing.email,
        photoURL: user.photoURL ?? existing.photoURL,
        updatedAt: serverTimestamp(),
        usernameLower: deleteField(),
      },
      { merge: true },
    );
    return {
      ...existing,
      email: user.email ?? existing.email,
      photoURL: user.photoURL ?? existing.photoURL,
    };
  }

  const payload = {
    uid: user.uid,
    email: user.email ?? null,
    username: null,
    bio: null,
    photoURL: user.photoURL ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(ref, payload);

  return {
    uid: user.uid,
    email: user.email ?? null,
    username: null,
    bio: null,
    photoURL: user.photoURL ?? null,
  };
}

/**
 * Check the users collection for an existing username.
 * Own UID is ignored so re-saving the same name works.
 */
export async function isUsernameTaken(
  username: string,
  excludeUid?: string,
): Promise<boolean> {
  const normalized = normalizeUsername(username);
  if (!normalized) {
    return false;
  }

  const snap = await getDocs(
    query(collection(firestore, USERS_COLLECTION), where('username', '==', normalized)),
  );

  if (snap.empty) {
    return false;
  }

  if (!excludeUid) {
    return true;
  }

  return snap.docs.some((d) => d.id !== excludeUid);
}

/**
 * Persist username on users/{uid} after uniqueness check against users only.
 * Also mirrors Auth displayName for existing UI helpers.
 */
export async function claimUsername(uid: string, rawUsername: string): Promise<string> {
  const formatError = validateUsernameFormat(rawUsername);
  if (formatError) {
    throw new Error(formatError);
  }

  const username = normalizeUsername(rawUsername);

  const taken = await isUsernameTaken(username, uid);
  if (taken) {
    throw new UsernameTakenError();
  }

  const again = await isUsernameTaken(username, uid);
  if (again) {
    throw new UsernameTakenError();
  }

  await setDoc(
    userRef(uid),
    {
      uid,
      username,
      updatedAt: serverTimestamp(),
      usernameLower: deleteField(),
    },
    { merge: true },
  );

  const conflictSnap = await getDocs(
    query(collection(firestore, USERS_COLLECTION), where('username', '==', username)),
  );
  const otherOwner = conflictSnap.docs.find((d) => d.id !== uid);
  if (otherOwner) {
    await setDoc(
      userRef(uid),
      {
        username: null,
        updatedAt: serverTimestamp(),
        usernameLower: deleteField(),
      },
      { merge: true },
    );
    throw new UsernameTakenError();
  }

  await updateUserDisplayName(username);
  return username;
}

/** Save bio on users/{uid}. Empty string clears the field to null. */
export async function updateUserBio(uid: string, rawBio: string): Promise<string | null> {
  const bio = rawBio.trim();
  if (bio.length > BIO_MAX) {
    throw new Error(`Bio must be ${BIO_MAX} characters or less.`);
  }

  const value = bio.length > 0 ? bio : null;
  await setDoc(
    userRef(uid),
    {
      bio: value,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
  return value;
}
