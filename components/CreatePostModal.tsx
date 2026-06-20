import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useMemo, useState } from 'react';
import {
  Alert,
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
import type { CommunityTopic, CreatePostInput } from '../types/community';
import GlassCard from './GlassCard';
import GradientBackground from './GradientBackground';
import { FORUM, RADIUS, TopicBadge } from './communityPostShared';

const TOPICS: CommunityTopic[] = ['Question', 'Advice', 'My Experience'];
const TITLE_MAX = 300;
const BODY_MAX = 40000;

type PostTab = 'text' | 'image';

type CreatePostModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (input: CreatePostInput) => void;
};

export default function CreatePostModal({
  visible,
  onClose,
  onSubmit,
}: CreatePostModalProps) {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<PostTab>('text');
  const [topic, setTopic] = useState<CommunityTopic>('Question');
  const [topicPickerOpen, setTopicPickerOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [photoUris, setPhotoUris] = useState<string[]>([]);

  const canPost = useMemo(() => {
    const hasTitle = title.trim().length > 0;
    if (tab === 'text') return hasTitle && body.trim().length > 0;
    return hasTitle && photoUris.length > 0;
  }, [tab, title, body, photoUris]);

  const reset = () => {
    setTab('text');
    setTopic('Question');
    setTopicPickerOpen(false);
    setTitle('');
    setBody('');
    setPhotoUris([]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();

    if (!trimmedTitle) {
      Alert.alert('Title required', 'Your post must have a title.');
      return;
    }
    if (tab === 'text' && !trimmedBody) {
      Alert.alert('Body required', 'Text posts need a body.');
      return;
    }
    if (tab === 'image' && photoUris.length === 0) {
      Alert.alert('Image required', 'Add at least one image for this post type.');
      return;
    }

    onSubmit({
      topic,
      title: trimmedTitle,
      body: trimmedBody || trimmedTitle,
      photoUris: tab === 'image' ? photoUris : [],
    });
    reset();
    onClose();
  };

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to add images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setPhotoUris((prev) => [...prev, ...result.assets.map((asset) => asset.uri)]);
    }
  };

  const removePhoto = (uri: string) => {
    setPhotoUris((prev) => prev.filter((u) => u !== uri));
  };

  const switchTab = (next: PostTab) => {
    setTab(next);
    if (next === 'text') setPhotoUris([]);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <GradientBackground style={styles.root}>
        <KeyboardAvoidingView
          style={[styles.fill, { paddingTop: insets.top }]}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleClose}
            hitSlop={8}
            style={styles.headerIconBtn}
            accessibilityLabel="Close"
          >
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create post</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!canPost}
            style={[styles.postBtn, !canPost && styles.postBtnDisabled]}
            activeOpacity={0.85}
          >
            <Text style={styles.postBtnText}>Post</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <GlassCard style={styles.section}>
            <TouchableOpacity
              style={styles.topicPicker}
              onPress={() => setTopicPickerOpen((v) => !v)}
              activeOpacity={0.8}
            >
              <TopicBadge topic={topic} />
              <View style={styles.topicInfo}>
                <Text style={styles.topicLabel}>Topic</Text>
                <Text style={styles.topicName}>{topic}</Text>
              </View>
              <Ionicons
                name={topicPickerOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={FORUM.muted}
              />
            </TouchableOpacity>

            {topicPickerOpen && (
              <View style={styles.topicDropdown}>
                {TOPICS.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.topicOption, topic === t && styles.topicOptionActive]}
                    onPress={() => {
                      setTopic(t);
                      setTopicPickerOpen(false);
                    }}
                  >
                    <TopicBadge topic={t} />
                    <Text style={styles.topicOptionName}>{t}</Text>
                    {topic === t && (
                      <Ionicons name="checkmark-circle" size={20} color={FORUM.accent} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </GlassCard>

          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabChip, tab === 'text' && styles.tabChipActive]}
              onPress={() => switchTab('text')}
            >
              <Ionicons
                name="document-text-outline"
                size={15}
                color={tab === 'text' ? '#fff' : 'rgba(255,255,255,0.6)'}
              />
              <Text style={[styles.tabText, tab === 'text' && styles.tabTextActive]}>
                Text
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabChip, tab === 'image' && styles.tabChipActive]}
              onPress={() => switchTab('image')}
            >
              <Ionicons
                name="images-outline"
                size={15}
                color={tab === 'image' ? '#fff' : 'rgba(255,255,255,0.6)'}
              />
              <Text style={[styles.tabText, tab === 'image' && styles.tabTextActive]}>
                Photos
              </Text>
            </TouchableOpacity>
          </View>

          <GlassCard style={styles.formCard}>
            <TextInput
              style={styles.titleInput}
              placeholder="Title"
              placeholderTextColor="rgba(255,255,255,0.45)"
              value={title}
              onChangeText={setTitle}
              maxLength={TITLE_MAX}
            />
            <View style={styles.divider} />

            {tab === 'text' ? (
              <TextInput
                style={styles.bodyInput}
                placeholder="What's on your mind?"
                placeholderTextColor="rgba(255,255,255,0.45)"
                value={body}
                onChangeText={setBody}
                multiline
                maxLength={BODY_MAX}
                textAlignVertical="top"
              />
            ) : (
              <View style={styles.imageSection}>
                {photoUris.length === 0 ? (
                  <TouchableOpacity
                    style={styles.imageDropzone}
                    onPress={pickImages}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="camera-outline" size={32} color={FORUM.muted} />
                    <Text style={styles.dropzoneTitle}>Add photos to your post</Text>
                    <Text style={styles.dropzoneAction}>Choose from library</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.imageGrid}>
                    {photoUris.map((uri) => (
                      <View key={uri} style={styles.imageTile}>
                        <Image source={{ uri }} style={styles.imagePreview} />
                        <TouchableOpacity
                          style={styles.removeImageBtn}
                          onPress={() => removePhoto(uri)}
                        >
                          <Ionicons name="close-circle" size={22} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ))}
                    <TouchableOpacity style={styles.addMoreTile} onPress={pickImages}>
                      <Ionicons name="add" size={28} color={FORUM.muted} />
                    </TouchableOpacity>
                  </View>
                )}

                <TextInput
                  style={styles.optionalBodyInput}
                  placeholder="Optional caption..."
                  placeholderTextColor="rgba(255,255,255,0.45)"
                  value={body}
                  onChangeText={setBody}
                  multiline
                  maxLength={BODY_MAX}
                  textAlignVertical="top"
                />
              </View>
            )}
          </GlassCard>

          <View style={styles.hintCard}>
            <Ionicons name="leaf-outline" size={16} color={FORUM.accent} />
            <Text style={styles.hintText}>
              Share growing tips, ask questions, or tell the community about your experience.
              Be kind and stay on topic.
            </Text>
          </View>
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
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: FORUM.border,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  postBtn: {
    backgroundColor: FORUM.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    minWidth: 64,
    alignItems: 'center',
  },
  postBtnDisabled: {
    opacity: 0.45,
  },
  postBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
    gap: 12,
  },
  section: {
    overflow: 'hidden',
  },
  topicPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  topicInfo: {
    flex: 1,
  },
  topicLabel: {
    color: FORUM.muted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  topicName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  topicDropdown: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: FORUM.border,
  },
  topicOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  topicOptionActive: {
    backgroundColor: 'rgba(0,141,65,0.12)',
  },
  topicOptionName: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tabChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  tabChipActive: {
    backgroundColor: FORUM.accent,
    borderColor: FORUM.accent,
  },
  tabText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  formCard: {
    overflow: 'hidden',
    minHeight: 200,
  },
  titleInput: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: FORUM.border,
    marginHorizontal: 14,
  },
  bodyInput: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: FORUM.body,
    minHeight: 160,
    lineHeight: 22,
  },
  imageSection: {
    padding: 12,
    gap: 12,
  },
  imageDropzone: {
    borderWidth: StyleSheet.hairlineWidth,
    borderStyle: 'dashed',
    borderColor: FORUM.border,
    borderRadius: RADIUS.inner,
    paddingVertical: 32,
    alignItems: 'center',
    gap: 6,
    backgroundColor: FORUM.inputBg,
  },
  dropzoneTitle: {
    color: FORUM.muted,
    fontSize: 14,
  },
  dropzoneAction: {
    color: FORUM.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imageTile: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: RADIUS.inner,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  addMoreTile: {
    width: 100,
    height: 100,
    borderRadius: RADIUS.inner,
    borderWidth: StyleSheet.hairlineWidth,
    borderStyle: 'dashed',
    borderColor: FORUM.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FORUM.inputBg,
  },
  optionalBodyInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: FORUM.border,
    borderRadius: RADIUS.inner,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#fff',
    minHeight: 80,
    backgroundColor: FORUM.inputBg,
  },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: RADIUS.inner,
    backgroundColor: 'rgba(0,141,65,0.1)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,141,65,0.25)',
  },
  hintText: {
    flex: 1,
    color: FORUM.muted,
    fontSize: 13,
    lineHeight: 19,
  },
});
