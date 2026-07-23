import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  BIO_MAX,
  claimUsername,
  getUserDocument,
  isUsernameTaken,
  updateUserBio,
  UsernameTakenError,
  validateUsernameFormat,
} from '../services/users';
import { getProfileUsername } from '../utils/profile';
import { useAuth } from './AuthContext';

const PROFILE_STORAGE_PREFIX = '@aerea/profile/';

type StoredProfile = {
  localPhotoUri: string | null;
};

export type UpdateProfileInput = {
  username: string;
  bio: string;
  photoUri?: string | null;
};

export type UpdateProfileResult = { ok: true } | { ok: false; error: string };

type ProfileContextValue = {
  username: string;
  bio: string;
  photoUrl: string | null;
  isReady: boolean;
  updateProfile: (input: UpdateProfileInput) => Promise<UpdateProfileResult>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

function storageKey(uid: string) {
  return `${PROFILE_STORAGE_PREFIX}${uid}`;
}

async function loadStoredProfile(uid: string): Promise<StoredProfile> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(uid));
    if (!raw) {
      return { localPhotoUri: null };
    }
    const parsed = JSON.parse(raw) as Partial<StoredProfile & { bio?: string }>;
    return {
      localPhotoUri: typeof parsed.localPhotoUri === 'string' ? parsed.localPhotoUri : null,
    };
  } catch {
    return { localPhotoUri: null };
  }
}

async function saveStoredProfile(uid: string, profile: StoredProfile): Promise<void> {
  await AsyncStorage.setItem(storageKey(uid), JSON.stringify(profile));
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, firestoreUsername, setFirestoreUsername } = useAuth();
  const [bio, setBio] = useState('');
  const [localPhotoUri, setLocalPhotoUri] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [localUsername, setLocalUsername] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!user?.uid) {
        setBio('');
        setLocalPhotoUri(null);
        setLocalUsername(null);
        setIsReady(true);
        return;
      }

      setIsReady(false);
      const [stored, firestoreUser] = await Promise.all([
        loadStoredProfile(user.uid),
        getUserDocument(user.uid).catch(() => null),
      ]);
      if (cancelled) {
        return;
      }
      setBio(firestoreUser?.bio ?? '');
      setLocalPhotoUri(stored.localPhotoUri);
      setLocalUsername(null);
      setIsReady(true);
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  const username = useMemo(() => {
    if (localUsername) {
      return localUsername;
    }
    if (firestoreUsername) {
      return firestoreUsername;
    }
    return getProfileUsername(user?.email, user?.displayName);
  }, [firestoreUsername, localUsername, user?.displayName, user?.email]);

  const photoUrl = localPhotoUri ?? user?.photoURL ?? null;

  const updateProfile = useCallback(
    async (input: UpdateProfileInput): Promise<UpdateProfileResult> => {
      if (!user?.uid) {
        return { ok: false, error: 'You must be signed in to edit your profile.' };
      }

      const trimmedUsername = input.username.trim();
      const trimmedBio = input.bio.trim();

      const formatError = validateUsernameFormat(trimmedUsername);
      if (formatError) {
        return { ok: false, error: formatError };
      }
      if (trimmedBio.length > BIO_MAX) {
        return { ok: false, error: `Bio must be ${BIO_MAX} characters or less.` };
      }

      try {
        if (trimmedUsername !== username) {
          const taken = await isUsernameTaken(trimmedUsername, user.uid);
          if (taken) {
            return { ok: false, error: new UsernameTakenError().message };
          }
          const savedUsername = await claimUsername(user.uid, trimmedUsername);
          setLocalUsername(savedUsername);
          setFirestoreUsername(savedUsername);
        }

        const savedBio = await updateUserBio(user.uid, trimmedBio);
        setBio(savedBio ?? '');

        const nextPhotoUri =
          input.photoUri === undefined ? localPhotoUri : input.photoUri;

        await saveStoredProfile(user.uid, {
          localPhotoUri: nextPhotoUri,
        });
        setLocalPhotoUri(nextPhotoUri);

        return { ok: true };
      } catch (e) {
        if (e instanceof UsernameTakenError) {
          return { ok: false, error: e.message };
        }
        if (e instanceof Error && e.message) {
          return { ok: false, error: e.message };
        }
        return { ok: false, error: 'Could not save profile. Please try again.' };
      }
    },
    [localPhotoUri, setFirestoreUsername, user?.uid, username],
  );

  const value = useMemo<ProfileContextValue>(
    () => ({
      username,
      bio,
      photoUrl,
      isReady,
      updateProfile,
    }),
    [username, bio, photoUrl, isReady, updateProfile],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return ctx;
}
