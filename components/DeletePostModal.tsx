import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { CommunityPost } from '../types/community';
import { useResponsive } from '../utils/responsive';

type Props = {
  visible: boolean;
  post: CommunityPost | null;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeletePostModal({ visible, post, onClose, onConfirm }: Props) {
  const r = useResponsive();
  const insets = useSafeAreaInsets();

  if (!visible || !post) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            {
              borderTopLeftRadius: r.scale(20),
              borderTopRightRadius: r.scale(20),
              paddingTop: r.scale(10),
              paddingHorizontal: r.horizontalPadding,
              paddingBottom: Math.max(insets.bottom, r.scale(16)),
            },
          ]}
          onPress={(event) => event.stopPropagation()}
        >
          <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, styles.tint]} />
          <View style={styles.borderTop} />

          <View style={[styles.handle, { marginBottom: r.scale(16) }]} />

          <View style={[styles.iconWrap, { width: r.scale(44), height: r.scale(44), borderRadius: r.scale(22) }]}>
            <Ionicons name="trash-outline" size={r.scale(22)} color="#FCA5A5" />
          </View>

          <Text style={[styles.title, { fontSize: r.scale(18), marginTop: r.scale(14) }]}>
            Delete post?
          </Text>
          <Text style={[styles.message, { fontSize: r.scale(14), marginTop: r.scale(8), lineHeight: r.scale(20) }]}>
            Are you sure you want to delete this post? This cannot be undone.
          </Text>

          <View
            style={[
              styles.preview,
              {
                marginTop: r.scale(16),
                paddingVertical: r.scale(12),
                paddingHorizontal: r.scale(14),
                borderRadius: r.scale(12),
              },
            ]}
          >
            <Text style={[styles.previewTitle, { fontSize: r.scale(14) }]} numberOfLines={2}>
              {post.title}
            </Text>
          </View>

          <View style={[styles.actions, { marginTop: r.scale(18), gap: r.scale(10) }]}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton, { borderRadius: r.scale(12), paddingVertical: r.scale(14) }]}
              activeOpacity={0.7}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cancel delete post"
            >
              <Text style={[styles.cancelText, { fontSize: r.scale(15) }]}>No</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton, { borderRadius: r.scale(12), paddingVertical: r.scale(14) }]}
              activeOpacity={0.7}
              onPress={onConfirm}
              accessibilityRole="button"
              accessibilityLabel="Confirm delete post"
            >
              <Text style={[styles.deleteText, { fontSize: r.scale(15) }]}>Yes, delete</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
    overflow: 'hidden',
    alignItems: 'center',
  },
  tint: {
    backgroundColor: 'rgba(10, 12, 20, 0.72)',
  },
  borderTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(248,113,113,0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(248,113,113,0.28)',
  },
  title: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  message: {
    color: 'rgba(255,255,255,0.58)',
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  preview: {
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  previewTitle: {
    color: 'rgba(255,255,255,0.82)',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignSelf: 'stretch',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  cancelButton: {
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  deleteButton: {
    borderColor: 'rgba(248,113,113,0.45)',
    backgroundColor: 'rgba(248,113,113,0.16)',
  },
  cancelText: {
    color: 'rgba(255,255,255,0.88)',
    fontWeight: '600',
  },
  deleteText: {
    color: '#FCA5A5',
    fontWeight: '700',
  },
});
