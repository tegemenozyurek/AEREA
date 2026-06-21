import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { sendUserVerificationEmail } from '../services/auth';
import { getFirebaseAuthErrorMessage } from '../services/authErrors';
import { useResponsive } from '../utils/responsive';

const LOGO_ASPECT_RATIO = 1390 / 694;
const AUTH_BG = '#121212';
const AUTH_SUBMIT_BG = '#0369A1';

export default function EmailVerificationScreen() {
  const { user, refreshEmailVerification, logout } = useAuth();
  const r = useResponsive();
  const [loading, setLoading] = useState<'resend' | 'refresh' | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const email = user?.email ?? 'your email';

  const handleResend = async () => {
    setLoading('resend');
    setError(null);
    setMessage(null);
    try {
      await sendUserVerificationEmail(user ?? undefined);
      setMessage('Verification email sent. Check your inbox.');
    } catch (e) {
      setError(getFirebaseAuthErrorMessage(e));
    } finally {
      setLoading(null);
    }
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

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View
          style={[
            styles.content,
            {
              paddingHorizontal: r.horizontalPadding,
              paddingTop: r.topPadding,
              maxWidth: r.contentMaxWidth,
            },
          ]}
        >
          <Image
            source={require('../assets/aerea-logo.png')}
            style={[styles.logo, { maxWidth: r.logoMaxWidth }]}
            resizeMode="contain"
          />

          <View style={styles.iconCircle}>
            <Ionicons name="mail-outline" size={32} color="#BAE6FD" />
          </View>

          <Text style={styles.title}>Verify your email</Text>
          <Text style={styles.body}>
            We sent a verification link to{' '}
            <Text style={styles.email}>{email}</Text>. Open the email and tap the link,
            then return here.
          </Text>

          {message && <Text style={styles.successText}>{message}</Text>}
          {error && <Text style={styles.errorText}>{error}</Text>}

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
              <ActivityIndicator color="#BAE6FD" />
            ) : (
              <Text style={styles.secondaryText}>Resend verification email</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signOutButton}
            onPress={() => void logout()}
            disabled={loading !== null}
            hitSlop={8}
          >
            <Text style={styles.signOutText}>Sign out</Text>
          </TouchableOpacity>
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
    alignItems: 'center',
    paddingBottom: 32,
  },
  logo: {
    width: '45%',
    height: undefined,
    aspectRatio: LOGO_ASPECT_RATIO,
    marginBottom: 28,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 12,
    textAlign: 'center',
  },
  body: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  email: {
    color: '#fff',
    fontWeight: '600',
  },
  successText: {
    color: '#BAE6FD',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorText: {
    color: '#FFB4B4',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: AUTH_SUBMIT_BG,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  secondaryText: {
    color: '#BAE6FD',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  signOutButton: {
    marginTop: 24,
    paddingVertical: 8,
  },
  signOutText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 14,
    fontWeight: '600',
  },
});
