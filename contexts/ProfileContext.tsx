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
import { MOCK_OWN_BIO } from '../data/mockUsers';
import { updateUserDisplayName } from '../services/auth';
import { getProfileUsername } from '../utils/profile';
import { useAuth } from './AuthContext';

const PROFILE_STORAGE_PREFIX = '@aerea/profile/';
const USERNAME_MAX = 30;
const BIO_MAX = 300;

type StoredProfile = {
  bio: string;
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
      return { bio: MOCK_OWN_BIO, localPhotoUri: null };
    }
    const parsed = JSON.parse(raw) as Partial<StoredProfile>;
    return {
      bio: typeof parsed.bio === 'string' ? parsed.bio : MOCK_OWN_BIO,
      localPhotoUri: typeof parsed.localPhotoUri === 'string' ? parsed.localPhotoUri : null,
    };
  } catch {
    return { bio: MOCK_OWN_BIO, localPhotoUri: null };
  }
}

async function saveStoredProfile(uid: string, profile: StoredProfile): Promise<void> {
  await AsyncStorage.setItem(storageKey(uid), JSON.stringify(profile));
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [bio, setBio] = useState(MOCK_OWN_BIO);
  const [localPhotoUri, setLocalPhotoUri] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!user?.uid) {
        setBio(MOCK_OWN_BIO);
        setLocalPhotoUri(null);
        setIsReady(true);
        return;
      }

      setIsReady(false);
      const stored = await loadStoredProfile(user.uid);
      if (cancelled) {
        return;
      }
      setBio(stored.bio);
      setLocalPhotoUri(stored.localPhotoUri);
      setIsReady(true);
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  const username = useMemo(
    () => getProfileUsername(user?.email, user?.displayName),
    [user?.displayName, user?.email],
  );

  const photoUrl = localPhotoUri ?? user?.photoURL ?? null;

  const updateProfile = useCallback(
    async (input: UpdateProfileInput): Promise<UpdateProfileResult> => {
      if (!user?.uid) {
        return { ok: false, error: 'You must be signed in to edit your profile.' };
      }

      const trimmedUsername = input.username.trim();
      const trimmedBio = input.bio.trim();

      if (!trimmedUsername) {
        return { ok: false, error: 'Username is required.' };
      }
      if (trimmedUsername.length > USERNAME_MAX) {
        return { ok: false, error: `Username must be ${USERNAME_MAX} characters or less.` };
      }
      if (trimmedBio.length > BIO_MAX) {
        return { ok: false, error: `Bio must be ${BIO_MAX} characters or less.` };
      }

      try {
        if (trimmedUsername !== username) {
          await updateUserDisplayName(trimmedUsername);
        }

        const nextPhotoUri =
          input.photoUri === undefined ? localPhotoUri : input.photoUri;

        await saveStoredProfile(user.uid, {
          bio: trimmedBio,
          localPhotoUri: nextPhotoUri,
        });

        setBio(trimmedBio);
        setLocalPhotoUri(nextPhotoUri);
        return { ok: true };
      } catch {
        return { ok: false, error: 'Could not save profile. Please try again.' };
      }
    },
    [localPhotoUri, user?.uid, username],
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
