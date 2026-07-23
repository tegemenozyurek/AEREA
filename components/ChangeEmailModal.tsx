import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
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
import { useResponsive } from '../utils/responsive';

const SUBMIT_BG = '#0369A1';

type Props = {
  visible: boolean;
  currentEmail: string;
  onClose: () => void;
};

function mapEmailChangeError(error: string, code?: string): string {
  if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
    return 'Current password is incorrect.';
  }
  return error;
}

export default function ChangeEmailModal({ visible, currentEmail, onClose }: Props) {
  const { requestEmailChange } = useAuth();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setNewEmail('');
      setCurrentPassword('');
      setError(null);
      setSuccess(false);
      setSaving(false);
    }
  }, [visible]);

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const handleSubmit = async () => {
    setError(null);

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

    setSuccess(true);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={handleClose}>
          <Pressable
            style={[
              styles.sheet,
              {
                borderRadius: r.scale(16),
                paddingBottom: insets.bottom + r.scale(16),
                maxWidth: r.contentMaxWidth,
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View
              style={[
                styles.header,
                {
                  paddingHorizontal: r.scale(18),
                  paddingTop: r.scale(18),
                  paddingBottom: r.scale(12),
                },
              ]}
            >
              <Text style={[styles.title, { fontSize: r.scale(18) }]}>Change email</Text>
              <TouchableOpacity
                style={[
                  styles.closeButton,
                  { width: r.scale(32), height: r.scale(32), borderRadius: r.scale(16) },
                ]}
                onPress={handleClose}
                disabled={saving}
                hitSlop={8}
                accessibilityLabel="Close"
              >
                <Ionicons name="close" size={r.scale(18)} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingHorizontal: r.scale(18), paddingBottom: r.scale(8) }}
              showsVerticalScrollIndicator={false}
            >
              {success ? (
                <View style={styles.successBlock}>
                  <View
                    style={[
                      styles.successIconWrap,
                      { width: r.scale(72), height: r.scale(72), borderRadius: r.scale(36) },
                    ]}
                  >
                    <Ionicons name="mail-outline" size={r.scale(40)} color="#BAE6FD" />
                  </View>
                  <Text style={[styles.successTitle, { fontSize: r.scale(20), marginTop: r.scale(20) }]}>
                    Check your inbox
                  </Text>
                  <Text style={[styles.successBody, { fontSize: r.scale(15), marginTop: r.scale(10) }]}>
                    We sent a confirmation link to {newEmail.trim().toLowerCase()}. Your email
                    updates after you verify that address.
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.primaryButton,
                      styles.successButton,
                      { borderRadius: r.scale(14), marginTop: r.scale(28) },
                    ]}
                    onPress={handleClose}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.primaryText, { fontSize: r.scale(16) }]}>Done</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <Text style={[styles.hint, { fontSize: r.scale(14), marginBottom: r.scale(16) }]}>
                    Current email: {currentEmail || '—'}. Enter a new address and confirm with your
                    password.
                  </Text>

                  <Text style={styles.fieldLabel}>New email</Text>
                  <TextInput
                    style={[styles.input, { marginTop: r.scale(8), borderRadius: r.scale(12) }]}
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

                  <Text style={[styles.fieldLabel, { marginTop: r.scale(16) }]}>Current password</Text>
                  <TextInput
                    style={[styles.input, { marginTop: r.scale(8), borderRadius: r.scale(12) }]}
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
                    <Text style={[styles.errorText, { fontSize: r.scale(13), marginTop: r.scale(12) }]}>
                      {error}
                    </Text>
                  ) : null}

                  <TouchableOpacity
                    style={[
                      styles.primaryButton,
                      { borderRadius: r.scale(12), marginTop: r.scale(20) },
                      saving && styles.buttonDisabled,
                    ]}
                    onPress={() => void handleSubmit()}
                    disabled={saving}
                    activeOpacity={0.85}
                  >
                    {saving ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={[styles.primaryText, { fontSize: r.scale(15) }]}>
                        Send confirmation
                      </Text>
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
    paddingHorizontal: 20,
  },
  sheet: {
    width: '100%',
    backgroundColor: 'rgba(15,23,42,0.96)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.15)',
    maxHeight: '90%',
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
    lineHeight: 20,
  },
  fieldLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  input: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  errorText: {
    color: '#FFB4B4',
    fontWeight: '500',
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: SUBMIT_BG,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  successBlock: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
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
    minHeight: 52,
  },
  successTitle: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
  successBody: {
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
});
