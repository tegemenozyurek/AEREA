import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useMemo, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GradientBackground from './GradientBackground';
import { FORUM, RADIUS } from './communityPostShared';
import type { CreateSeedListingInput, SeedExchangeType } from '../types/seedExchange';

type CreateSeedListingModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (input: CreateSeedListingInput) => void;
};

export default function CreateSeedListingModal({
  visible,
  onClose,
  onSubmit,
}: CreateSeedListingModalProps) {
  const insets = useSafeAreaInsets();
  const [exchangeType, setExchangeType] = useState<SeedExchangeType>('trade');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [photoUris, setPhotoUris] = useState<string[]>([]);

  const canPost = useMemo(() => {
    const hasTitle = title.trim().length > 0;
    const hasBody = body.trim().length > 0;
    if (exchangeType === 'trade') {
      return hasTitle && hasBody && lookingFor.trim().length > 0;
    }
    return hasTitle && hasBody;
  }, [title, body, lookingFor, exchangeType]);

  const reset = () => {
    setExchangeType('trade');
    setTitle('');
    setBody('');
    setLookingFor('');
    setPhotoUris([]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsMultipleSelection: false,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setPhotoUris([result.assets[0].uri]);
    }
  };

  const handleSubmit = () => {
    if (!canPost) return;
    onSubmit({
      title,
      body,
      photoUris,
      exchangeType,
      lookingFor: exchangeType === 'trade' ? lookingFor : '',
    });
    handleClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <GradientBackground style={styles.root}>
        <KeyboardAvoidingView
          style={[styles.fill, { paddingTop: insets.top }]}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} hitSlop={8}>
            <Ionicons name="close" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New listing</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!canPost}
            style={[styles.postBtn, !canPost && styles.postBtnDisabled]}
          >
            <Text style={styles.postBtnText}>Post</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Type</Text>
          <View style={styles.typeRow}>
            {(['trade', 'donate'] as SeedExchangeType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.typeChip, exchangeType === type && styles.typeChipActive]}
                onPress={() => setExchangeType(type)}
              >
                <Ionicons
                  name={type === 'trade' ? 'swap-horizontal' : 'gift-outline'}
                  size={16}
                  color={exchangeType === type ? '#fff' : FORUM.muted}
                />
                <Text style={[styles.typeText, exchangeType === type && styles.typeTextActive]}>
                  {type === 'trade' ? 'Trade' : 'Donate'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Wild tomato seeds — open pollination"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={title}
            onChangeText={setTitle}
            maxLength={120}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell others what you have and any details..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={body}
            onChangeText={setBody}
            multiline
            maxLength={500}
          />

          {exchangeType === 'trade' && (
            <>
              <Text style={styles.label}>Open to trade for</Text>
              <Text style={styles.fieldHint}>
                Which seeds would you accept in a swap?
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Berry-type tomato or pepper seeds"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={lookingFor}
                onChangeText={setLookingFor}
                maxLength={200}
              />
            </>
          )}

          <Text style={styles.label}>Seed photo (optional)</Text>
          <TouchableOpacity style={styles.photoBtn} onPress={pickPhoto}>
            <Ionicons name="camera-outline" size={22} color="#fff" />
            <Text style={styles.photoBtnText}>
              {photoUris.length > 0 ? 'Change photo' : 'Add photo'}
            </Text>
          </TouchableOpacity>
          {photoUris[0] ? (
            <Image source={{ uri: photoUris[0] }} style={styles.preview} />
          ) : null}

          <Text style={styles.hint}>
            Seed Exchange is for free trades and donations only — no sales.
          </Text>
        </ScrollView>
        </KeyboardAvoidingView>
      </GradientBackground>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  fill: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: FORUM.border,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  postBtn: {
    backgroundColor: FORUM.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.inner,
  },
  postBtnDisabled: {
    opacity: 0.45,
  },
  postBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  form: {
    padding: 16,
    gap: 8,
    paddingBottom: 40,
  },
  label: {
    color: FORUM.muted,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldHint: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: RADIUS.inner,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: FORUM.border,
    backgroundColor: FORUM.inputBg,
  },
  typeChipActive: {
    backgroundColor: FORUM.accent,
    borderColor: FORUM.accent,
  },
  typeText: {
    color: FORUM.muted,
    fontWeight: '600',
  },
  typeTextActive: {
    color: '#fff',
  },
  input: {
    backgroundColor: FORUM.inputBg,
    borderRadius: RADIUS.inner,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: FORUM.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 15,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: RADIUS.inner,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: FORUM.border,
    backgroundColor: FORUM.inputBg,
  },
  photoBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: RADIUS.inner,
    marginTop: 8,
  },
  hint: {
    color: FORUM.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 16,
    textAlign: 'center',
  },
});
