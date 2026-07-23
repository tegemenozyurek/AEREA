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
import { USERNAME_MAX, USERNAME_MIN } from '../services/users';
import { useResponsive } from '../utils/responsive';

const AUTH_BG = '#121212';
const AUTH_SUBMIT_BG = '#0369A1';

function sanitizeUsernameInput(value: string): string {
  return value.toLowerCase().replace(/[^a-z_]/g, '').slice(0, USERNAME_MAX);
}

export default function UsernameSetupScreen() {
  const { completeUsernameSetup, logout } = useAuth();
  const r = useResponsive();
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    const result = await completeUsernameSetup(username);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    setError(null);
    await logout();
    setSigningOut(false);
  };

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
            <Text style={styles.title}>Choose a username</Text>
            <Text style={styles.body}>
              Pick a name others will see. Only lowercase letters (a–z) and underscores — no
              spaces, numbers, or uppercase.
            </Text>

            <TextInput
              style={styles.input}
              value={username}
              onChangeText={(value) => setUsername(sanitizeUsernameInput(value))}
              placeholder="username"
              placeholderTextColor="rgba(255,255,255,0.35)"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              keyboardType="ascii-capable"
              maxLength={USERNAME_MAX}
              editable={!loading && !signingOut}
              onSubmitEditing={() => void handleSubmit()}
              returnKeyType="done"
            />
            <Text style={styles.hint}>
              {USERNAME_MIN}–{USERNAME_MAX} characters · lowercase only
            </Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.submit, (loading || signingOut) && styles.submitDisabled]}
              onPress={() => void handleSubmit()}
              disabled={loading || signingOut}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Continue</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signOut}
              onPress={() => void handleSignOut()}
              disabled={loading || signingOut}
              activeOpacity={0.7}
            >
              {signingOut ? (
                <ActivityIndicator color="rgba(255,255,255,0.55)" />
              ) : (
                <Text style={styles.signOutText}>Sign out</Text>
              )}
            </TouchableOpacity>
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
    alignSelf: 'center',
    width: '100%',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginBottom: 10,
  },
  body: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 28,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 14,
    marginBottom: 14,
    fontWeight: '500',
  },
  submit: {
    backgroundColor: AUTH_SUBMIT_BG,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  signOut: {
    marginTop: 18,
    alignItems: 'center',
    paddingVertical: 10,
    minHeight: 40,
    justifyContent: 'center',
  },
  signOutText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 14,
    fontWeight: '600',
  },
});
