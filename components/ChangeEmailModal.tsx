import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { reloadCurrentUser } from '../services/auth';
import { useResponsive } from '../utils/responsive';

const SUBMIT_BG = '#0369A1';
const POLL_MS = 3000;

type Phase = 'form' | 'waiting' | 'done';

type Props = {
  visible: boolean;
  currentEmail: string;
  onClose: () => void;
  onSuccess?: () => void;
};

function mapEmailChangeError(error: string, code?: string): string {
  if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
    return 'Current password is incorrect.';
  }
  return error;
}

export default function ChangeEmailModal({ visible, currentEmail, onClose, onSuccess }: Props) {
  const { user, requestEmailChange, refreshUser } = useAuth();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<Phase>('form');
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const passwordRef = useRef('');

  const resetForm = useCallback(() => {
    setPhase('form');
    setNewEmail('');
    setCurrentPassword('');
    setPendingEmail('');
    setError(null);
    setInfo(null);
    setSaving(false);
    setChecking(false);
    passwordRef.current = '';
  }, []);

  useEffect(() => {
    if (visible) {
      resetForm();
    }
  }, [visible, resetForm]);

  const finishVerified = useCallback(
    async (verifiedEmail: string) => {
      await refreshUser();
      setPendingEmail(verifiedEmail);
      setPhase('done');
      onSuccess?.();
    },
    [onSuccess, refreshUser],
  );

  const checkEmailUpdated = useCallback(async (): Promise<boolean> => {
    const refreshed = await reloadCurrentUser();
    const next = refreshed?.email?.trim().toLowerCase() ?? '';
    const target = pendingEmail.trim().toLowerCase();
    if (next && target && next === target) {
      await finishVerified(next);
      return true;
    }
    return false;
  }, [finishVerified, pendingEmail]);

  useEffect(() => {
    if (!visible || phase !== 'waiting' || !pendingEmail) {
      return;
    }

    let cancelled = false;

    const tick = async () => {
      if (cancelled) return;
      try {
        await checkEmailUpdated();
      } catch {
        // Keep waiting; user can tap "I've verified".
      }
    };

    void tick();
    const id = setInterval(() => {
      void tick();
    }, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [visible, phase, pendingEmail, checkEmailUpdated]);

  const handleClose = () => {
    if (saving || checking) return;
    // While waiting, allow cancel — verification may still complete later in the inbox.
    onClose();
  };

  const handleSubmit = async () => {
    setError(null);
    setInfo(null);

    const trimmed = newEmail.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }

    if (trimmed === currentEmail.trim().toLowerCase()) {
      setError('New email must be different from your current email.');
      return;
    }

    if (!currentPassword) {
      setError('Enter your current password.');
      return;
    }

    setSaving(true);
    const result = await requestEmailChange(trimmed, currentPassword);
    setSaving(false);

    if (!result.ok) {
      setError(mapEmailChangeError(result.error, result.code));
      return;
    }

    passwordRef.current = currentPassword;
    setPendingEmail(trimmed);
    setPhase('waiting');
  };

  const handleCheckVerified = async () => {
    setChecking(true);
    setError(null);
    setInfo(null);
    try {
      const ok = await checkEmailUpdated();
      if (!ok) {
        setError('Email not updated yet. Open the link in your new inbox, then try again.');
      }
    } catch {
      setError('Could not check verification status. Try again.');
    } finally {
      setChecking(false);
    }
  };

  const handleResend = async () => {
    setSaving(true);
    setError(null);
    setInfo(null);
    const result = await requestEmailChange(pendingEmail, passwordRef.current || currentPassword);
    setSaving(false);
    if (!result.ok) {
      setError(mapEmailChangeError(result.error, result.code));
      return;
    }
    setInfo('Confirmation email sent again. Check inbox and spam.');
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable
          style={[
            styles.backdrop,
            {
              paddingHorizontal: r.horizontalPadding,
              paddingVertical: r.scale(24),
            },
          ]}
          onPress={phase === 'waiting' ? undefined : handleClose}
        >
          <Pressable
            style={[
              styles.sheet,
              {
                borderRadius: r.scale(16),
                paddingBottom: Math.max(insets.bottom, r.scale(12)) + r.scale(8),
                width: '100%',
                maxWidth: Math.min(r.contentMaxWidth, r.width - r.horizontalPadding * 2),
                maxHeight: Math.min(r.height * 0.82, r.scale(560)),
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View
              style={[
                styles.header,
                {
                  paddingHorizontal: r.scale(16),
                  paddingTop: r.scale(16),
                  paddingBottom: r.scale(10),
                },
              ]}
            >
              <Text
                style={[styles.title, { fontSize: r.scale(17), flex: 1, paddingRight: r.scale(8) }]}
                numberOfLines={1}
              >
                {phase === 'waiting'
                  ? 'Confirm new email'
                  : phase === 'done'
                    ? 'Email updated'
                    : 'Change email'}
              </Text>
              {phase !== 'waiting' ? (
                <TouchableOpacity
                  style={[
                    styles.closeButton,
                    { width: r.scale(32), height: r.scale(32), borderRadius: r.scale(16) },
                  ]}
                  onPress={handleClose}
                  disabled={saving || checking}
                  hitSlop={8}
                  accessibilityLabel="Close"
                >
                  <Ionicons name="close" size={r.scale(18)} color="#fff" />
                </TouchableOpacity>
              ) : (
                <View style={{ width: r.scale(32) }} />
              )}
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              bounces={false}
              contentContainerStyle={{
                paddingHorizontal: r.scale(16),
                paddingBottom: r.scale(12),
                flexGrow: 1,
              }}
              showsVerticalScrollIndicator={false}
            >
              {phase === 'done' ? (
                <View style={[styles.successBlock, { paddingVertical: r.scale(6) }]}>
                  <View
                    style={[
                      styles.successIconWrap,
                      {
                        width: r.scale(64),
                        height: r.scale(64),
                        borderRadius: r.scale(32),
                      },
                    ]}
                  >
                    <Ionicons name="checkmark-circle" size={r.scale(40)} color="#BAE6FD" />
                  </View>
                  <Text
                    style={[
                      styles.successTitle,
                      { fontSize: r.scale(18), marginTop: r.scale(16) },
                    ]}
                  >
                    Email updated
                  </Text>
                  <Text
                    style={[
                      styles.successBody,
                      {
                        fontSize: r.scale(14),
                        lineHeight: r.scale(20),
                        marginTop: r.scale(8),
                      },
                    ]}
                  >
                    Your account email is now {pendingEmail}.
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.primaryButton,
                      styles.successButton,
                      {
                        borderRadius: r.scale(12),
                        marginTop: r.scale(20),
                        minHeight: r.scale(48),
                        paddingVertical: r.scale(12),
                      },
                    ]}
                    onPress={handleClose}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.primaryText, { fontSize: r.scale(15) }]}>Done</Text>
                  </TouchableOpacity>
                </View>
              ) : phase === 'waiting' ? (
                <View style={[styles.waitingBlock, { paddingVertical: r.scale(4) }]}>
                  <ActivityIndicator color="#BAE6FD" size="small" />
                  <Text
                    style={[
                      styles.waitingTitle,
                      { fontSize: r.scale(16), marginTop: r.scale(14) },
                    ]}
                  >
                    Waiting for verification
                  </Text>
                  <Text
                    style={[
                      styles.hint,
                      {
                        fontSize: r.scale(13),
                        lineHeight: r.scale(19),
                        marginTop: r.scale(8),
                      },
                    ]}
                  >
                    We sent a confirmation link to{' '}
                    <Text style={styles.emailHighlight}>{pendingEmail}</Text>. Stay on this screen
                    until you open that link. We’ll detect it automatically.
                  </Text>

                  <View
                    style={[
                      styles.warningBox,
                      {
                        marginTop: r.scale(14),
                        paddingVertical: r.scale(10),
                        paddingHorizontal: r.scale(12),
                        borderRadius: r.scale(12),
                        gap: r.scale(8),
                      },
                    ]}
                  >
                    <Ionicons name="information-circle-outline" size={r.scale(18)} color="#FCD34D" />
                    <Text
                      style={[
                        styles.warningText,
                        { fontSize: r.scale(12), lineHeight: r.scale(17), flex: 1 },
                      ]}
                    >
                      After you verify, you may be signed out and returned to the login screen. Sign
                      in again with your new email and the same password.
                    </Text>
                  </View>

                  {info ? (
                    <Text
                      style={[
                        styles.infoText,
                        {
                          fontSize: r.scale(12),
                          lineHeight: r.scale(17),
                          marginTop: r.scale(10),
                        },
                      ]}
                    >
                      {info}
                    </Text>
                  ) : null}
                  {error ? (
                    <Text
                      style={[
                        styles.errorText,
                        {
                          fontSize: r.scale(12),
                          lineHeight: r.scale(17),
                          marginTop: r.scale(10),
                        },
                      ]}
                    >
                      {error}
                    </Text>
                  ) : null}

                  <TouchableOpacity
                    style={[
                      styles.primaryButton,
                      {
                        borderRadius: r.scale(12),
                        marginTop: r.scale(18),
                        minHeight: r.scale(46),
                        paddingVertical: r.scale(11),
                        alignSelf: 'stretch',
                      },
                      (checking || saving) && styles.buttonDisabled,
                    ]}
                    onPress={() => void handleCheckVerified()}
                    disabled={checking || saving}
                    activeOpacity={0.85}
                  >
                    {checking ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={[styles.primaryText, { fontSize: r.scale(14) }]}>
                        I've verified
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.secondaryButton,
                      {
                        borderRadius: r.scale(12),
                        marginTop: r.scale(8),
                        minHeight: r.scale(46),
                        paddingVertical: r.scale(11),
                        alignSelf: 'stretch',
                      },
                      (checking || saving) && styles.buttonDisabled,
                    ]}
                    onPress={() => void handleResend()}
                    disabled={checking || saving}
                    activeOpacity={0.85}
                  >
                    {saving ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={[styles.secondaryText, { fontSize: r.scale(14) }]}>
                        Resend email
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.cancelLink, { marginTop: r.scale(12), paddingVertical: r.scale(8) }]}
                    onPress={handleClose}
                    disabled={checking || saving}
                    hitSlop={8}
                  >
                    <Text style={[styles.cancelLinkText, { fontSize: r.scale(13) }]}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <Text
                    style={[
                      styles.hint,
                      {
                        fontSize: r.scale(13),
                        lineHeight: r.scale(19),
                        marginBottom: r.scale(14),
                        textAlign: 'left',
                      },
                    ]}
                  >
                    Current email: {currentEmail || '—'}. After you continue, you’ll stay on a waiting
                    screen until the new address is verified. Verifying may sign you out — you’ll
                    need to log in again with the new email.
                  </Text>

                  <Text style={[styles.fieldLabel, { fontSize: r.scale(11) }]}>New email</Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        marginTop: r.scale(8),
                        borderRadius: r.scale(12),
                        fontSize: r.scale(15),
                        paddingHorizontal: r.scale(14),
                        paddingVertical: r.scale(12),
                      },
                    ]}
                    placeholder="new@email.com"
                    placeholderTextColor="rgba(255,255,255,0.45)"
                    value={newEmail}
                    onChangeText={(text) => {
                      setNewEmail(text);
                      setError(null);
                    }}
                    editable={!saving}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    autoComplete="email"
                  />

                  <Text style={[styles.fieldLabel, { fontSize: r.scale(11), marginTop: r.scale(14) }]}>
                    Current password
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        marginTop: r.scale(8),
                        borderRadius: r.scale(12),
                        fontSize: r.scale(15),
                        paddingHorizontal: r.scale(14),
                        paddingVertical: r.scale(12),
                      },
                    ]}
                    placeholder="Current password"
                    placeholderTextColor="rgba(255,255,255,0.45)"
                    secureTextEntry
                    value={currentPassword}
                    onChangeText={(text) => {
                      setCurrentPassword(text);
                      setError(null);
                    }}
                    editable={!saving}
                    autoCapitalize="none"
                  />

                  {error ? (
                    <Text
                      style={[
                        styles.errorText,
                        {
                          fontSize: r.scale(12),
                          lineHeight: r.scale(17),
                          marginTop: r.scale(10),
                        },
                      ]}
                    >
                      {error}
                    </Text>
                  ) : null}

                  <TouchableOpacity
                    style={[
                      styles.primaryButton,
                      {
                        borderRadius: r.scale(12),
                        marginTop: r.scale(18),
                        minHeight: r.scale(48),
                        paddingVertical: r.scale(12),
                      },
                      saving && styles.buttonDisabled,
                    ]}
                    onPress={() => void handleSubmit()}
                    disabled={saving}
                    activeOpacity={0.85}
                  >
                    {saving ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={[styles.primaryText, { fontSize: r.scale(15) }]}>Continue</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheet: {
    backgroundColor: 'rgba(15,23,42,0.96)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  hint: {
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
  },
  emailHighlight: {
    color: '#fff',
    fontWeight: '700',
  },
  warningBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(252, 211, 77, 0.1)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(252, 211, 77, 0.35)',
  },
  warningText: {
    color: 'rgba(255, 236, 179, 0.92)',
    fontWeight: '500',
  },
  fieldLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  input: {
    color: '#fff',
    fontWeight: '500',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  errorText: {
    color: '#FFB4B4',
    fontWeight: '500',
    textAlign: 'center',
  },
  infoText: {
    color: '#BAE6FD',
    fontWeight: '500',
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: SUBMIT_BG,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryText: {
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  waitingBlock: {
    alignItems: 'center',
    width: '100%',
  },
  waitingTitle: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
  cancelLink: {
    alignItems: 'center',
  },
  cancelLinkText: {
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '600',
  },
  successBlock: {
    width: '100%',
    alignItems: 'center',
  },
  successIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(186,230,253,0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(186,230,253,0.35)',
  },
  successButton: {
    alignSelf: 'stretch',
    width: '100%',
  },
  successTitle: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
  successBody: {
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});
