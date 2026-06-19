import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
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
import type { UpdateProfileInput } from '../contexts/ProfileContext';
import { getProfileInitials } from '../utils/profile';
import { useResponsive } from '../utils/responsive';

const USERNAME_MAX = 30;
const BIO_MAX = 300;

type Props = {
  visible: boolean;
  username: string;
  bio: string;
  photoUrl?: string | null;
  onClose: () => void;
  onSave: (input: UpdateProfileInput) => Promise<{ ok: true } | { ok: false; error: string }>;
};

export default function EditProfileModal({
  visible,
  username,
  bio,
  photoUrl,
  onClose,
  onSave,
}: Props) {
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const [draftUsername, setDraftUsername] = useState(username);
  const [draftBio, setDraftBio] = useState(bio);
  const [draftPhotoUri, setDraftPhotoUri] = useState<string | null>(photoUrl ?? null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setDraftUsername(username);
      setDraftBio(bio);
      setDraftPhotoUri(photoUrl ?? null);
      setSaving(false);
    }
  }, [visible, username, bio, photoUrl]);

  const handleClose = () => {
    if (saving) {
      return;
    }
    onClose();
  };

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to change your profile photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]) {
      setDraftPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (saving) {
      return;
    }

    setSaving(true);
    const result = await onSave({
      username: draftUsername,
      bio: draftBio,
      photoUri: draftPhotoUri,
    });
    setSaving(false);

    if (!result.ok) {
      Alert.alert('Could not save', result.error);
      return;
    }

    onClose();
  };

  if (!visible) {
    return null;
  }

  const avatarSize = r.scale(88);
  const initials = getProfileInitials(draftUsername || username);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={handleClose}>
          <Pressable
            style={[
              styles.sheet,
              {
                borderRadius: r.scale(18),
                padding: r.scale(18),
                maxWidth: r.contentMaxWidth,
                maxHeight: '88%',
              },
            ]}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.header}>
              <Text style={[styles.title, { fontSize: r.scale(18) }]}>Edit profile</Text>
              <Pressable
                style={[
                  styles.closeButton,
                  { width: r.scale(32), height: r.scale(32), borderRadius: r.scale(16) },
                ]}
                onPress={handleClose}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Close edit profile"
              >
                <Ionicons name="close" size={r.scale(18)} color="#fff" />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: insets.bottom + r.scale(8) }}
            >
              <View style={[styles.photoSection, { marginTop: r.scale(18), gap: r.scale(12) }]}>
                {draftPhotoUri ? (
                  <Image
                    source={{ uri: draftPhotoUri }}
                    style={[
                      styles.avatar,
                      {
                        width: avatarSize,
                        height: avatarSize,
                        borderRadius: avatarSize / 2,
                      },
                    ]}
                  />
                ) : (
                  <View
                    style={[
                      styles.avatarFallback,
                      {
                        width: avatarSize,
                        height: avatarSize,
                        borderRadius: avatarSize / 2,
                      },
                    ]}
                  >
                    <Text style={[styles.avatarInitials, { fontSize: r.scale(28) }]}>{initials}</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.photoButton, { borderRadius: r.scale(12), paddingVertical: r.scale(10), paddingHorizontal: r.scale(14) }]}
                  activeOpacity={0.7}
                  onPress={() => void pickPhoto()}
                >
                  <Ionicons name="camera-outline" size={r.scale(16)} color="#fff" />
                  <Text style={[styles.photoButtonText, { fontSize: r.scale(14) }]}>Change photo</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.fieldLabel, { fontSize: r.scale(12), marginTop: r.scale(18) }]}>
                Username
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    marginTop: r.scale(8),
                    paddingVertical: r.scale(12),
                    paddingHorizontal: r.scale(14),
                    borderRadius: r.scale(12),
                    fontSize: r.scale(16),
                  },
                ]}
                value={draftUsername}
                onChangeText={setDraftUsername}
                placeholder="Username"
                placeholderTextColor="rgba(255,255,255,0.45)"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={USERNAME_MAX}
                returnKeyType="next"
              />

              <Text style={[styles.fieldLabel, { fontSize: r.scale(12), marginTop: r.scale(18) }]}>
                Bio
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.bioInput,
                  {
                    marginTop: r.scale(8),
                    paddingVertical: r.scale(12),
                    paddingHorizontal: r.scale(14),
                    borderRadius: r.scale(12),
                    fontSize: r.scale(15),
                    minHeight: r.scale(96),
                  },
                ]}
                value={draftBio}
                onChangeText={setDraftBio}
                placeholder="Tell others about yourself"
                placeholderTextColor="rgba(255,255,255,0.45)"
                multiline
                textAlignVertical="top"
                maxLength={BIO_MAX}
              />
              <Text style={[styles.counter, { fontSize: r.scale(11), marginTop: r.scale(6) }]}>
                {draftBio.length}/{BIO_MAX}
              </Text>

              <View style={[styles.actions, { marginTop: r.scale(18), gap: r.scale(10) }]}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonSecondary, { borderRadius: r.scale(12) }]}
                  activeOpacity={0.7}
                  onPress={handleClose}
                  disabled={saving}
                >
                  <Text style={[styles.actionText, { fontSize: r.scale(15) }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonPrimary, { borderRadius: r.scale(12) }]}
                  activeOpacity={0.7}
                  onPress={() => void handleSave()}
                  disabled={saving || !draftUsername.trim()}
                >
                  <Text style={[styles.actionText, styles.actionTextPrimary, { fontSize: r.scale(15) }]}>
                    {saving ? 'Saving…' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>
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
  photoSection: {
    alignItems: 'center',
  },
  avatar: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(96,165,250,0.45)',
    backgroundColor: 'rgba(96,165,250,0.18)',
  },
  avatarInitials: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  photoButtonText: {
    color: '#fff',
    fontWeight: '600',
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
  bioInput: {
    fontWeight: '400',
  },
  counter: {
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'right',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  actionButtonSecondary: {
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  actionButtonPrimary: {
    borderColor: 'rgba(96,165,250,0.5)',
    backgroundColor: 'rgba(96,165,250,0.2)',
  },
  actionText: {
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  actionTextPrimary: {
    color: '#fff',
    fontWeight: '700',
  },
});
