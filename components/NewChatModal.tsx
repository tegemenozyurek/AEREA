import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChat } from '../contexts/ChatContext';
import type { ChatUser } from '../types/chat';
import { FORUM, formatRelativeTime, RADIUS } from './communityPostShared';

type NewChatModalProps = {
  visible: boolean;
  onClose: () => void;
};

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 42%)`;
}

function UserAvatar({ name, size = 44 }: { name: string; size?: number }) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: avatarColor(name),
        },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.4 }]}>{initial}</Text>
    </View>
  );
}

export default function NewChatModal({ visible, onClose }: NewChatModalProps) {
  const { width: screenWidth } = useWindowDimensions();
  const { users, currentUserName, openChatWithUser } = useChat();

  const availableUsers = useMemo(
    () =>
      users.filter(
        (u) => u.displayName.toLowerCase() !== currentUserName.toLowerCase(),
      ),
    [users, currentUserName],
  );

  const handleSelect = (chatUser: ChatUser) => {
    openChatWithUser(chatUser.id);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={[styles.sheet, { width: screenWidth }]} edges={['bottom']}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>New message</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={availableUsers}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.userRow}
                activeOpacity={0.7}
                onPress={() => handleSelect(item)}
              >
                <UserAvatar name={item.displayName} />
                <Text style={styles.userName}>{item.displayName}</Text>
                <Ionicons name="chevron-forward" size={18} color={FORUM.muted} />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.empty}>No users available.</Text>
            }
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
}

export { UserAvatar, avatarColor };

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    maxHeight: '70%',
    backgroundColor: 'rgba(20,28,24,0.96)',
    borderTopLeftRadius: RADIUS.card,
    borderTopRightRadius: RADIUS.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: FORUM.border,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: FORUM.border,
  },
  sheetTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 24,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  userName: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
  },
  empty: {
    color: FORUM.muted,
    textAlign: 'center',
    marginTop: 32,
    fontSize: 15,
  },
});
