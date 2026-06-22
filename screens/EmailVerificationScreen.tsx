import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useResponsive } from '../utils/responsive';

const AUTH_BG = '#121212';
const AUTH_SUBMIT_BG = '#0369A1';

export default function EmailVerificationScreen() {
  const { verificationUser, refreshEmailVerification, resendVerificationEmail, cancelVerification } =
    useAuth();
  const r = useResponsive();
  const [loading, setLoading] = useState<'resend' | 'refresh' | 'signOut' | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const email = verificationUser?.email ?? 'your email';

  const handleResend = async () => {
    setLoading('resend');
    setError(null);
    setMessage(null);
    const result = await resendVerificationEmail();
    setLoading(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage('Verification email sent. Check your inbox and spam.');
  };

  const handleRefresh = async () => {
    setLoading('refresh');
    setError(null);
    setMessage(null);
    const result = await refreshEmailVerification();
    setLoading(null);
    if (!result.ok) {
      setError(result.error);
    }
  };

  const handleSignOut = async () => {
    setLoading('signOut');
    setError(null);
    const result = await cancelVerification();
    setLoading(null);
    if (!result.ok) {
      setError(result.error);
    }
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View
          style={[
            styles.content,
            {
              paddingHorizontal: r.horizontalPadding,
              paddingTop: r.topPadding + 8,
              maxWidth: r.contentMaxWidth,
            },
          ]}
        >
          <View style={styles.topSection}>
            <Text style={styles.title}>Verify your email</Text>
            <Text style={styles.body}>
              We sent a link to <Text style={styles.email}>{email}</Text>. Check your inbox and spam.
            </Text>

            {message ? <Text style={styles.successText}>{message}</Text> : null}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.primaryButton, loading === 'refresh' && styles.buttonDisabled]}
              activeOpacity={0.85}
              onPress={() => void handleRefresh()}
              disabled={loading !== null}
            >
              {loading === 'refresh' ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryText}>I've verified my email</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, loading === 'resend' && styles.buttonDisabled]}
              activeOpacity={0.85}
              onPress={() => void handleResend()}
              disabled={loading !== null}
            >
              {loading === 'resend' ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.secondaryText}>Resend Email</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signOutButton}
              onPress={() => void handleSignOut()}
              disabled={loading !== null}
              hitSlop={8}
            >
              {loading === 'signOut' ? (
                <ActivityIndicator color="rgba(255,255,255,0.55)" />
              ) : (
                <Text style={styles.signOutText}>Sign Out</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AUTH_BG,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
  },
  topSection: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginBottom: 16,
  },
  body: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 16,
    lineHeight: 24,
  },
  email: {
    color: '#fff',
    fontWeight: '700',
  },
  successText: {
    color: '#BAE6FD',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 16,
    lineHeight: 20,
  },
  errorText: {
    color: '#FFB4B4',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 16,
    lineHeight: 20,
  },
  actions: {
    paddingBottom: 8,
    gap: 12,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: AUTH_SUBMIT_BG,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  secondaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  signOutButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  signOutText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 15,
    fontWeight: '600',
  },
});
