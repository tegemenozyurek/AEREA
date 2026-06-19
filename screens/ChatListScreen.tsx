import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NewChatModal, { UserAvatar } from '../components/NewChatModal';
import { CURRENT_USER_ID } from '../data/mockChatUsers';
import { useChat } from '../contexts/ChatContext';
import type { ChatConversation } from '../types/chat';
import { FORUM, formatRelativeTime } from '../components/communityPostShared';

type ChatListScreenProps = {
  onBack: () => void;
};

function lastMessagePreview(conversation: ChatConversation): string {
  const last = conversation.messages[conversation.messages.length - 1];
  if (!last) return 'No messages yet';
  const prefix = last.senderId === CURRENT_USER_ID ? 'You: ' : '';
  return `${prefix}${last.body}`;
}

export default function ChatListScreen({ onBack }: ChatListScreenProps) {
  const { width: screenWidth } = useWindowDimensions();
  const {
    conversations,
    openConversation,
    getOtherParticipant,
    getUnreadCount,
  } = useChat();
  const [newChatVisible, setNewChatVisible] = useState(false);

  const renderItem = ({ item }: { item: ChatConversation }) => {
    const other = getOtherParticipant(item);
    const unread = getUnreadCount(item.id);
    const name = other?.displayName ?? 'Unknown';

    return (
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.7}
        onPress={() => openConversation(item.id)}
      >
        <UserAvatar name={name} />
        <View style={styles.rowBody}>
          <View style={styles.rowTop}>
            <Text style={[styles.name, unread > 0 && styles.nameUnread]} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.time}>{formatRelativeTime(item.updatedAt)}</Text>
          </View>
          <View style={styles.rowBottom}>
            <Text style={styles.preview} numberOfLines={1}>
              {lastMessagePreview(item)}
            </Text>
            {unread > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unread > 99 ? '99+' : unread}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { width: screenWidth }]} edges={['top']}>
      <View style={[styles.header, { width: screenWidth }]}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => setNewChatVisible(true)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="New message"
        >
          <Ionicons name="create-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="chatbubbles-outline" size={48} color={FORUM.muted} />
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptyText}>
              Tap the compose button to start a private chat.
            </Text>
          </View>
        }
      />

      <NewChatModal visible={newChatVisible} onClose={() => setNewChatVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: 'transparent',
  },
  header: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  backBtn: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 12,
    justifyContent: 'center',
    width: 36,
    height: 36,
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  newBtn: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 12,
    justifyContent: 'center',
    width: 36,
    height: 36,
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  listContent: {
    paddingBottom: 100,
    paddingTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  rowBody: {
    flex: 1,
    gap: 4,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  rowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    flex: 1,
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
    fontWeight: '600',
  },
  nameUnread: {
    color: '#fff',
    fontWeight: '700',
  },
  time: {
    color: FORUM.muted,
    fontSize: 12,
  },
  preview: {
    flex: 1,
    color: FORUM.muted,
    fontSize: 14,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: FORUM.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  emptyText: {
    color: FORUM.muted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
