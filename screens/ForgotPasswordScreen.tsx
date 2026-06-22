import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useResponsive } from '../utils/responsive';

const AUTH_BG = '#121212';
const AUTH_SUBMIT_BG = '#0369A1';

type ForgotPasswordScreenProps = {
  initialEmail?: string;
  onBack: () => void;
};

export default function ForgotPasswordScreen({ initialEmail = '', onBack }: ForgotPasswordScreenProps) {
  const { resetPassword } = useAuth();
  const r = useResponsive();
  const [email, setEmail] = useState(initialEmail);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSend = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Enter your email.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);
    const result = await resetPassword(trimmedEmail);
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSentTo(trimmedEmail);
  };

  const handleResend = async () => {
    if (!sentTo) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    const result = await resetPassword(sentTo);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage('Password reset email sent again. Check your inbox and spam.');
  };

  const sent = Boolean(sentTo);

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
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
              <Text style={styles.title}>{sent ? 'Check your email' : 'Forgot password?'}</Text>
              {sent ? (
                <Text style={styles.body}>
                  We sent a password reset link to <Text style={styles.email}>{sentTo}</Text>. Open
                  the email and follow the link to choose a new password.
                </Text>
              ) : (
                <Text style={styles.body}>
                  Enter the email for your account and we&apos;ll send you a link to reset your
                  password.
                </Text>
              )}

              {!sent && (
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError(null);
                  }}
                  editable={!loading}
                />
              )}

              {message ? <Text style={styles.successText}>{message}</Text> : null}
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>

            <View style={styles.actions}>
              {sent ? (
                <TouchableOpacity
                  style={[styles.secondaryButton, loading && styles.buttonDisabled]}
                  activeOpacity={0.85}
                  onPress={() => void handleResend()}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.secondaryText}>Resend Email</Text>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.primaryButton, loading && styles.buttonDisabled]}
                  activeOpacity={0.85}
                  onPress={() => void handleSend()}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryText}>Send reset link</Text>
                  )}
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.backButton}
                onPress={onBack}
                disabled={loading}
                hitSlop={8}
              >
                <Text style={styles.backText}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
  },
  topSection: {
    flex: 1,
    gap: 16,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.2,
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
  input: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 15,
    marginTop: 4,
  },
  successText: {
    color: '#BAE6FD',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  errorText: {
    color: '#FFB4B4',
    fontSize: 14,
    fontWeight: '500',
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
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  backText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 15,
    fontWeight: '600',
  },
});
