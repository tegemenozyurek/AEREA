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
import {
  claimUsername,
  USERNAME_MAX,
  USERNAME_MIN,
  UsernameTakenError,
  validateUsernameFormat,
} from '../services/users';
import { useResponsive } from '../utils/responsive';

const SUBMIT_BG = '#0369A1';

type Props = {
  visible: boolean;
  currentUsername: string;
  onClose: () => void;
  onSuccess?: (username: string) => void;
};

function sanitizeUsernameInput(value: string): string {
  return value.toLowerCase().replace(/[^a-z_]/g, '').slice(0, USERNAME_MAX);
}

export default function ChangeUsernameModal({
  visible,
  currentUsername,
  onClose,
  onSuccess,
}: Props) {
  const { user, setFirestoreUsername } = useAuth();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState(currentUsername);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setUsername(currentUsername);
      setError(null);
      setSuccess(false);
      setSaving(false);
    }
  }, [visible, currentUsername]);

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const handleSubmit = async () => {
    setError(null);
    if (!user?.uid) {
      setError('You must be signed in.');
      return;
    }

    const formatError = validateUsernameFormat(username);
    if (formatError) {
      setError(formatError);
      return;
    }

    const next = username.trim().toLowerCase();
    if (next === currentUsername) {
      setError('New username must be different from your current username.');
      return;
    }

    setSaving(true);
    try {
      const saved = await claimUsername(user.uid, next);
      setFirestoreUsername(saved);
      setSuccess(true);
      onSuccess?.(saved);
    } catch (e) {
      if (e instanceof UsernameTakenError) {
        setError(e.message);
      } else if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Could not update username. Please try again.');
      }
    } finally {
      setSaving(false);
    }
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
              <Text style={[styles.title, { fontSize: r.scale(18) }]}>Change username</Text>
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
                    <Ionicons name="checkmark-circle" size={r.scale(48)} color="#BAE6FD" />
                  </View>
                  <Text style={[styles.successTitle, { fontSize: r.scale(20), marginTop: r.scale(20) }]}>
                    Username updated
                  </Text>
                  <Text style={[styles.successBody, { fontSize: r.scale(15), marginTop: r.scale(10) }]}>
                    Your username is now @{username}.
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
                    {USERNAME_MIN}–{USERNAME_MAX} characters. Lowercase letters and underscores only.
                  </Text>

                  <Text style={styles.fieldLabel}>Username</Text>
                  <TextInput
                    style={[styles.input, { marginTop: r.scale(8), borderRadius: r.scale(12) }]}
                    placeholder="username"
                    placeholderTextColor="rgba(255,255,255,0.45)"
                    value={username}
                    onChangeText={(text) => {
                      setUsername(sanitizeUsernameInput(text));
                      setError(null);
                    }}
                    editable={!saving}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="ascii-capable"
                    maxLength={USERNAME_MAX}
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
                        Update username
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
