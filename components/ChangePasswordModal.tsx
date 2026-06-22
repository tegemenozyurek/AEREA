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
const RULE_ACTIVE = '#BAE6FD';

const PASSWORD_RULES: { test: (s: string) => boolean; label: string }[] = [
  { test: (s) => s.length >= 8, label: 'At least 8 characters' },
  { test: (s) => /[A-Z]/.test(s), label: 'One uppercase letter' },
  { test: (s) => /[a-z]/.test(s), label: 'One lowercase letter' },
  { test: (s) => /\d/.test(s), label: 'One number' },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

function mapChangePasswordError(error: string, code?: string): string {
  if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
    return 'Current password is incorrect.';
  }
  return error;
}

export default function ChangePasswordModal({ visible, onClose, onSuccess }: Props) {
  const { changePassword } = useAuth();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
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

    if (!currentPassword) {
      setError('Enter your current password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (!PASSWORD_RULES.every((rule) => rule.test(newPassword))) {
      setError('New password does not meet the requirements.');
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from your current password.');
      return;
    }

    setSaving(true);
    const result = await changePassword(currentPassword, newPassword);
    setSaving(false);

    if (!result.ok) {
      setError(mapChangePasswordError(result.error, result.code));
      return;
    }

    setSuccess(true);
    onSuccess?.();
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
              <Text style={[styles.title, { fontSize: r.scale(18) }]}>Change password</Text>
              <TouchableOpacity
                style={[styles.closeButton, { width: r.scale(32), height: r.scale(32), borderRadius: r.scale(16) }]}
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
                  <View style={[styles.successIconWrap, { width: r.scale(72), height: r.scale(72), borderRadius: r.scale(36) }]}>
                    <Ionicons name="checkmark-circle" size={r.scale(48)} color="#BAE6FD" />
                  </View>
                  <Text style={[styles.successTitle, { fontSize: r.scale(20), marginTop: r.scale(20) }]}>
                    Password updated
                  </Text>
                  <Text style={[styles.successBody, { fontSize: r.scale(15), marginTop: r.scale(10) }]}>
                    Your password has been changed successfully.
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
                    Enter your current password, then choose a new one.
                  </Text>

                  <Text style={styles.fieldLabel}>Current password</Text>
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

                  <Text style={[styles.fieldLabel, { marginTop: r.scale(16) }]}>New password</Text>
                  <TextInput
                    style={[styles.input, { marginTop: r.scale(8), borderRadius: r.scale(12) }]}
                    placeholder="New password"
                    placeholderTextColor="rgba(255,255,255,0.45)"
                    secureTextEntry
                    value={newPassword}
                    onChangeText={(text) => {
                      setNewPassword(text);
                      setError(null);
                    }}
                    editable={!saving}
                    autoCapitalize="none"
                  />

                  <View style={[styles.rules, { marginTop: r.scale(10) }]}>
                    {PASSWORD_RULES.map(({ test, label }) => {
                      const ok = test(newPassword);
                      return (
                        <View key={label} style={styles.ruleRow}>
                          <View style={[styles.ruleDot, ok && styles.ruleDotActive]} />
                          <Text style={[styles.ruleText, ok && styles.ruleTextActive]}>{label}</Text>
                        </View>
                      );
                    })}
                  </View>

                  <Text style={[styles.fieldLabel, { marginTop: r.scale(16) }]}>Confirm new password</Text>
                  <TextInput
                    style={[styles.input, { marginTop: r.scale(8), borderRadius: r.scale(12) }]}
                    placeholder="Confirm new password"
                    placeholderTextColor="rgba(255,255,255,0.45)"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
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
                      <Text style={[styles.primaryText, { fontSize: r.scale(15) }]}>Update password</Text>
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
  flex: {
    flex: 1,
  },
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
  rules: {
    gap: 6,
    paddingHorizontal: 2,
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
    backgroundColor: RULE_ACTIVE,
  },
  ruleText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    fontWeight: '500',
  },
  ruleTextActive: {
    color: '#fff',
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
