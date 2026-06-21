import { useEffect } from 'react';
import { Linking } from 'react-native';
import { reloadCurrentUser } from '../services/auth';
import { completeEmailVerificationFromLink } from '../services/emailVerificationLink';

type Options = {
  onVerified?: () => void;
  onError?: (message: string) => void;
};

export function useEmailVerificationLink({ onVerified, onError }: Options = {}) {
  useEffect(() => {
    const handleUrl = async (url: string | null | undefined) => {
      if (!url) return;

      try {
        const completed = await completeEmailVerificationFromLink(url);
        if (!completed) return;

        await reloadCurrentUser();
        onVerified?.();
      } catch {
        onError?.('Could not complete email verification from this link.');
      }
    };

    void Linking.getInitialURL().then((url) => handleUrl(url));

    const subscription = Linking.addEventListener('url', ({ url }) => {
      void handleUrl(url);
    });

    return () => subscription.remove();
  }, [onError, onVerified]);
}
