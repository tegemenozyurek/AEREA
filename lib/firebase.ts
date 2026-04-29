import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import * as fbAuth from 'firebase/auth';
import type { Auth } from 'firebase/auth';

// Public Firebase web client config — safe to commit (apiKey is not a secret;
// security is enforced by Firebase rules + auth, not by hiding the key).
export const firebaseConfig = {
  apiKey: 'AIzaSyCerVeY8ds_PW9PCLI_StcteEmpZANqCu8',
  authDomain: 'aerea-39995.firebaseapp.com',
  projectId: 'aerea-39995',
  storageBucket: 'aerea-39995.firebasestorage.app',
  messagingSenderId: '1070126863207',
  appId: '1:1070126863207:web:150770ced3ff674d2995c2',
  measurementId: 'G-V3NNZ5P5CW',
} as const;

export const firebaseApp: FirebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

function createAuth(): Auth {
  if (Platform.OS === 'web') {
    return fbAuth.getAuth(firebaseApp);
  }

  // getReactNativePersistence is exported from firebase/auth's RN entry point only.
  // We access it through the namespace to avoid a TypeScript error on web type defs.
  const rnPersistence = (
    fbAuth as unknown as {
      getReactNativePersistence?: (storage: unknown) => fbAuth.Persistence;
    }
  ).getReactNativePersistence;

  if (typeof rnPersistence === 'function') {
    try {
      return fbAuth.initializeAuth(firebaseApp, {
        persistence: rnPersistence(AsyncStorage),
      });
    } catch {
      // initializeAuth throws if it has already been initialized
      // (happens with Fast Refresh) — fall back to getAuth().
    }
  }

  return fbAuth.getAuth(firebaseApp);
}

export const firebaseAuth: Auth = createAuth();
