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
      setPhotoUris((prev) => [
        ...prev,
        ...result.assets.map((asset) => asset.uri),
      ]);
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
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={[styles.root, { paddingTop: insets.top }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Reddit-style header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleClose}
            hitSlop={10}
            style={styles.headerIconBtn}
            accessibilityLabel="Close"
          >
            <Ionicons name="close" size={24} color="#1A1A1B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create a post</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!canPost}
            style={[styles.postBtn, !canPost && styles.postBtnDisabled]}
            activeOpacity={0.85}
          >
            <Text style={[styles.postBtnText, !canPost && styles.postBtnTextDisabled]}>
              Post
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Topic picker */}
          <View style={styles.communitySection}>
            <TouchableOpacity
              style={styles.communityPicker}
              onPress={() => setTopicPickerOpen((v) => !v)}
              activeOpacity={0.8}
            >
              <View style={styles.communityAvatar}>
                <Text style={styles.communityAvatarText}>
                  {topic.charAt(0)}
                </Text>
              </View>
              <View style={styles.communityInfo}>
                <Text style={styles.communityLabel}>Topic</Text>
                <Text style={styles.communityName}>{topic}</Text>
              </View>
              <Ionicons
                name={topicPickerOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color="#878A8C"
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
                    <View style={styles.topicOptionAvatar}>
                      <Text style={styles.topicOptionAvatarText}>
                        {t.charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.topicOptionText}>
                      <Text style={styles.topicOptionName}>{t}</Text>
                      <Text style={styles.topicOptionDesc}>Post category</Text>
                    </View>
                    {topic === t && (
                      <Ionicons name="checkmark" size={18} color="#FF4500" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Post type tabs — Text | Images & Video */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tab, tab === 'text' && styles.tabActive]}
              onPress={() => switchTab('text')}
            >
              <Ionicons
                name="document-text-outline"
                size={18}
                color={tab === 'text' ? '#FF4500' : '#878A8C'}
              />
              <Text style={[styles.tabText, tab === 'text' && styles.tabTextActive]}>
                Text
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, tab === 'image' && styles.tabActive]}
              onPress={() => switchTab('image')}
            >
              <Ionicons
                name="image-outline"
                size={18}
                color={tab === 'image' ? '#FF4500' : '#878A8C'}
              />
              <Text style={[styles.tabText, tab === 'image' && styles.tabTextActive]}>
                Images & Video
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form card */}
          <View style={styles.formCard}>
            <TextInput
              style={styles.titleInput}
              placeholder="Title"
              placeholderTextColor="#878A8C"
              value={title}
              onChangeText={setTitle}
              maxLength={TITLE_MAX}
            />
            <View style={styles.titleDivider} />

            {tab === 'text' ? (
              <TextInput
                style={styles.bodyInput}
                placeholder="Text"
                placeholderTextColor="#878A8C"
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
                    <Ionicons name="cloud-upload-outline" size={36} color="#878A8C" />
                    <Text style={styles.dropzoneTitle}>Drag and drop images or</Text>
                    <Text style={styles.dropzoneAction}>Upload</Text>
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
                          <Ionicons name="close-circle" size={22} color="#1A1A1B" />
                        </TouchableOpacity>
                      </View>
                    ))}
                    <TouchableOpacity style={styles.addMoreTile} onPress={pickImages}>
                      <Ionicons name="add" size={28} color="#878A8C" />
                    </TouchableOpacity>
                  </View>
                )}

                <TextInput
                  style={styles.imageBodyInput}
                  placeholder="Add an optional body text..."
                  placeholderTextColor="#878A8C"
                  value={body}
                  onChangeText={setBody}
                  multiline
                  maxLength={BODY_MAX}
                  textAlignVertical="top"
                />
              </View>
            )}
          </View>

          {/* Reddit-style rules hint */}
          <View style={styles.rulesCard}>
            <Text style={styles.rulesTitle}>Posting in: {topic}</Text>
            <Text style={styles.rulesItem}>1. Remember the human</Text>
            <Text style={styles.rulesItem}>2. Behave like you would in real life</Text>
            <Text style={styles.rulesItem}>3. Look for the original source of content</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#DAE0E6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDEFF1',
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#1A1A1B',
    fontSize: 16,
    fontWeight: '700',
  },
  postBtn: {
    backgroundColor: '#FF4500',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 64,
    alignItems: 'center',
  },
  postBtnDisabled: {
    backgroundColor: '#FF450033',
  },
  postBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  postBtnTextDisabled: {
    color: '#FFFFFF99',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
    gap: 12,
  },
  communitySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EDEFF1',
    overflow: 'hidden',
  },
  communityPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  communityAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0079D3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  communityAvatarText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  communityInfo: {
    flex: 1,
  },
  communityLabel: {
    color: '#878A8C',
    fontSize: 11,
    fontWeight: '500',
  },
  communityName: {
    color: '#1A1A1B',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 1,
  },
  topicDropdown: {
    borderTopWidth: 1,
    borderTopColor: '#EDEFF1',
  },
  topicOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EDEFF1',
  },
  topicOptionActive: {
    backgroundColor: '#FFF7F5',
  },
  topicOptionAvatar: {
    width: 28,
    height: 28,
    borderRadius: 16,
    backgroundColor: '#FF4500',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicOptionAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  topicOptionText: {
    flex: 1,
  },
  topicOptionName: {
    color: '#1A1A1B',
    fontSize: 13,
    fontWeight: '700',
  },
  topicOptionDesc: {
    color: '#878A8C',
    fontSize: 11,
    marginTop: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EDEFF1',
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#FF4500',
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    color: '#878A8C',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  tabTextActive: {
    color: '#FF4500',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EDEFF1',
    overflow: 'hidden',
    minHeight: 200,
  },
  titleInput: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1B',
  },
  titleDivider: {
    height: 1,
    backgroundColor: '#EDEFF1',
  },
  bodyInput: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1A1A1B',
    minHeight: 160,
    lineHeight: 22,
  },
  imageSection: {
    padding: 12,
    gap: 12,
  },
  imageDropzone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#CCD0D5',
    borderRadius: 16,
    paddingVertical: 36,
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F6F7F8',
  },
  dropzoneTitle: {
    color: '#878A8C',
    fontSize: 14,
  },
  dropzoneAction: {
    color: '#0079D3',
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
    borderRadius: 16,
    backgroundColor: '#EDEFF1',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  addMoreTile: {
    width: 100,
    height: 100,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#CCD0D5',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6F7F8',
  },
  imageBodyInput: {
    borderWidth: 1,
    borderColor: '#EDEFF1',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1A1B',
    minHeight: 80,
    backgroundColor: '#F6F7F8',
  },
  rulesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EDEFF1',
    padding: 14,
  },
  rulesTitle: {
    color: '#1A1A1B',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  rulesItem: {
    color: '#878A8C',
    fontSize: 12,
    lineHeight: 20,
  },
});
