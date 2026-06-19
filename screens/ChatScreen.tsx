import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ChatBubble from '../components/ChatBubble';
import { UserAvatar } from '../components/NewChatModal';
import { FORUM, RADIUS } from '../components/communityPostShared';
import { useChat } from '../contexts/ChatContext';
import type { ChatMessage } from '../types/chat';

type ChatScreenProps = {
  conversationId: string;
  onBack: () => void;
};

export default function ChatScreen({ conversationId, onBack }: ChatScreenProps) {
  const { width: screenWidth } = useWindowDimensions();
  const { getConversation, getOtherParticipant, sendMessage, currentUserId } = useChat();
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const conversation = getConversation(conversationId);
  const other = conversation ? getOtherParticipant(conversation) : null;
  const otherName = other?.displayName ?? 'Chat';

  useEffect(() => {
    if (conversation?.messages.length) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 50);
    }
  }, [conversation?.messages.length, conversationId]);

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed || !conversation) return;
    sendMessage(conversation.id, trimmed);
    setDraft('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  if (!conversation) {
    return (
      <SafeAreaView style={[styles.safeArea, { width: screenWidth }]} edges={['top']}>
        <View style={[styles.header, { width: screenWidth }]}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat</Text>
        </View>
        <View style={styles.missing}>
          <Text style={styles.missingText}>Conversation not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { width: screenWidth }]} edges={['top']}>
      <View style={[styles.header, { width: screenWidth }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onBack}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <UserAvatar name={otherName} size={32} />
          <Text style={styles.headerTitle} numberOfLines={1}>
            {otherName}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
        <FlatList
          ref={listRef}
          data={conversation.messages}
          keyExtractor={(item) => item.id}
          style={[styles.flex, { width: screenWidth }]}
          contentContainerStyle={[
            styles.messagesContent,
            conversation.messages.length === 0 && styles.messagesEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <ChatBubble
              body={item.body}
              createdAt={item.createdAt}
              isOwn={item.senderId === currentUserId}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="chatbubble-ellipses-outline" size={40} color={FORUM.muted} />
              <Text style={styles.emptyText}>
                Say hello to {otherName} — your messages are private.
              </Text>
            </View>
          }
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: false })
          }
        />

        <View style={[styles.inputBar, { width: screenWidth }]}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder={`Message ${otherName}...`}
              placeholderTextColor="rgba(255,255,255,0.45)"
              value={draft}
              onChangeText={setDraft}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[styles.sendBtn, !draft.trim() && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!draft.trim()}
              accessibilityRole="button"
              accessibilityLabel="Send message"
            >
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: 'transparent',
  },
  flex: {
    flex: 1,
    alignSelf: 'stretch',
  },
  header: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: FORUM.border,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: '60%',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
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
  messagesContent: {
    paddingTop: 12,
    paddingBottom: 16,
  },
  messagesEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyText: {
    color: FORUM.muted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  inputBar: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: FORUM.border,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: FORUM.inputBg,
    borderRadius: RADIUS.inner,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: FORUM.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 15,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: FORUM.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.45,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missingText: {
    color: FORUM.muted,
    fontSize: 15,
  },
});
