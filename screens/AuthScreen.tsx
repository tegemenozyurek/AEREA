import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinkableText from '../components/LinkableText';
import AuthSocialOptions from '../components/AuthSocialOptions';
import { useAuth } from '../contexts/AuthContext';
import { useResponsive } from '../utils/responsive';

type AuthScreenProps = {
  linkMessage?: string | null;
  onClearLinkMessage?: () => void;
};

type AuthMode = 'login' | 'register';
type LoginHelp = 'none' | 'credentials';

const LOGO_ASPECT_RATIO = 1390 / 694;

/** Auth screen palette — dark anthracite background, green logo accent. */
const AUTH_BG = '#121212';
const AUTH_DEEP = '#121212';
const AUTH_TAB_ACTIVE_BG = 'rgba(255,255,255,0.94)';
const AUTH_SUBMIT_BG = '#0369A1';
const AUTH_RULE_ACTIVE = '#BAE6FD';

const PASSWORD_RULES: { test: (s: string) => boolean; label: string }[] = [
  { test: (s) => s.length >= 8, label: 'At least 8 characters' },
  { test: (s) => /[A-Z]/.test(s), label: 'One uppercase letter' },
  { test: (s) => /[a-z]/.test(s), label: 'One lowercase letter' },
  { test: (s) => /\d/.test(s), label: 'One number' },
];

export default function AuthScreen({ linkMessage, onClearLinkMessage }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loginHelp, setLoginHelp] = useState<LoginHelp>('none');
  const [loading, setLoading] = useState(false);

  const { login, register, resetPassword } = useAuth();
  const r = useResponsive();
  const isLogin = mode === 'login';

  useEffect(() => {
    if (linkMessage) {
      setInfo(linkMessage);
      onClearLinkMessage?.();
    }
  }, [linkMessage, onClearLinkMessage]);

  const openEmailApp = () => {
    void Linking.openURL(Platform.OS === 'ios' ? 'message://' : 'mailto:');
  };

  const clearFeedback = () => {
    setError(null);
    setInfo(null);
    setLoginHelp('none');
  };

  const handleModeChange = (next: AuthMode) => {
    setMode(next);
    clearFeedback();
  };

  const handleSubmit = async () => {
    setError(null);
    setInfo(null);
    setLoginHelp('none');
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('Enter your email.');
      return;
    }

    if (isLogin) {
      setLoading(true);
      const result = await login(trimmedEmail, password);
      setLoading(false);
      if (!result.ok) {
        setError(result.error);
        if (result.code !== 'auth/email-not-verified') {
          setLoginHelp('credentials');
        }
      }
      return;
    }

    if (password !== passwordConfirm) {
      setError('Passwords do not match.');
      return;
    }

    if (!PASSWORD_RULES.every((rule) => rule.test(password))) {
      setError('Password does not meet the requirements.');
      return;
    }

    setLoading(true);
    const result = await register(trimmedEmail, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
    }
  };

  const handleResetPassword = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Enter your email to reset your password.');
      return;
    }
    setLoading(true);
    setError(null);
    const result = await resetPassword(trimmedEmail);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setInfo(`Password reset email sent to ${trimmedEmail}.`);
    setLoginHelp('none');
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingHorizontal: r.horizontalPadding,
                paddingTop: r.topPadding,
              },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Image
              source={require('../assets/aerea-logo.png')}
              style={[styles.logo, { maxWidth: r.logoMaxWidth }]}
              resizeMode="contain"
            />

            <View style={[styles.contentContainer, { maxWidth: r.contentMaxWidth }]}>
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tab, isLogin && styles.tabActive]}
                  activeOpacity={0.8}
                  onPress={() => handleModeChange('login')}
                  disabled={loading}
                >
                  <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>
                    Sign In
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, !isLogin && styles.tabActive]}
                  activeOpacity={0.8}
                  onPress={() => handleModeChange('register')}
                  disabled={loading}
                >
                  <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.form}>
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
                    if (loginHelp !== 'none') setLoginHelp('none');
                    setError(null);
                  }}
                  editable={!loading}
                />
                <View>
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    secureTextEntry
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (loginHelp !== 'none') setLoginHelp('none');
                      setError(null);
                    }}
                    editable={!loading}
                  />
                  {!isLogin && (
                    <View style={styles.rules}>
                      {PASSWORD_RULES.map(({ test, label }) => {
                        const ok = test(password);
                        return (
                          <View key={label} style={styles.ruleRow}>
                            <View style={[styles.ruleDot, ok && styles.ruleDotActive]} />
                            <Text style={[styles.ruleText, ok && styles.ruleTextActive]}>
                              {label}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
                {!isLogin && (
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    secureTextEntry
                    value={passwordConfirm}
                    onChangeText={setPasswordConfirm}
                    editable={!loading}
                  />
                )}

                {error && <LinkableText text={error} style={styles.errorText} linkStyle={styles.errorLink} />}

                {info && (
                  <View style={styles.infoBanner}>
                    <LinkableText text={info} style={styles.infoText} linkStyle={styles.infoLink} />
                    <View style={styles.infoActions}>
                      <TouchableOpacity
                        style={styles.openMailButton}
                        onPress={openEmailApp}
                        disabled={loading}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.openMailButtonText}>Open email app</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setInfo(null)}
                        hitSlop={8}
                        accessibilityLabel="Dismiss message"
                      >
                        <Text style={styles.dismissText}>Dismiss</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {isLogin && loginHelp === 'credentials' && (
                  <View style={styles.helpBox}>
                    <Text style={styles.helpTitle}>Need help?</Text>
                    <Text style={styles.helpHint}>
                      Check your email and password, or reset your password below.
                    </Text>
                    <TouchableOpacity
                      style={styles.helpAction}
                      onPress={() => void handleResetPassword()}
                      disabled={loading}
                    >
                      <Text style={styles.helpActionText}>Reset password</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.helpDismiss}
                      onPress={() => setLoginHelp('none')}
                      hitSlop={8}
                    >
                      <Text style={styles.dismissText}>Dismiss</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  activeOpacity={0.85}
                  onPress={() => void handleSubmit()}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitText}>
                      {isLogin ? 'Sign In' : 'Create Account'}
                    </Text>
                  )}
                </TouchableOpacity>

                <AuthSocialOptions />
              </View>
            </View>
          </ScrollView>
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
    backgroundColor: 'transparent',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  logo: {
    width: '45%',
    height: undefined,
    aspectRatio: LOGO_ASPECT_RATIO,
    alignSelf: 'center',
    marginBottom: 36,
  },
  contentContainer: {
    width: '100%',
    alignSelf: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: AUTH_TAB_ACTIVE_BG,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  tabText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    fontWeight: '600',
  },
  tabTextActive: {
    color: AUTH_DEEP,
    fontWeight: '700',
  },
  form: {
    gap: 14,
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
  },
  rules: {
    marginTop: 10,
    paddingHorizontal: 4,
    gap: 6,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ruleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  ruleDotActive: {
    backgroundColor: AUTH_RULE_ACTIVE,
  },
  ruleText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    fontWeight: '500',
  },
  ruleTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: AUTH_SUBMIT_BG,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.25)',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  submitButtonDisabled: {
    opacity: 0.75,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  errorText: {
    color: '#FFB4B4',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: -2,
  },
  infoText: {
    color: '#BAE6FD',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
    flex: 1,
  },
  infoBanner: {
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  infoActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  helpBox: {
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  helpTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  helpHint: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
  helpAction: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  helpActionText: {
    color: '#BAE6FD',
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  helpActionSecondary: {
    alignSelf: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  helpActionSecondaryText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  helpDismiss: {
    alignSelf: 'center',
    paddingTop: 4,
  },
  dismissText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    fontWeight: '600',
  },
  infoLink: {
    color: '#E0F2FE',
  },
  errorLink: {
    color: '#FFD4D4',
  },
  openMailButton: {
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  openMailButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
