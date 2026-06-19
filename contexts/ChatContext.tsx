import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { mockConversations } from '../data/mockConversations';
import {
  CURRENT_USER_ID,
  getChatUserByDisplayName,
  getChatUserById,
  getChatUserIdForAuthorName,
  MOCK_CHAT_USERS,
} from '../data/mockChatUsers';
import type { ChatConversation, ChatMessage, ChatUser } from '../types/chat';
import { useAuth } from './AuthContext';

type LastReadMap = Record<string, string>;

type ChatContextValue = {
  currentUserId: string;
  currentUserName: string;
  users: ChatUser[];
  conversations: ChatConversation[];
  totalUnread: number;
  chatView: 'inbox' | 'conversation' | null;
  activeConversationId: string | null;
  openInbox: () => void;
  closeChat: () => void;
  openConversation: (conversationId: string) => void;
  openChatWithUser: (userId: string) => void;
  openChatWithAuthor: (authorName: string) => void;
  sendMessage: (conversationId: string, body: string) => void;
  getConversation: (conversationId: string) => ChatConversation | undefined;
  getOtherParticipant: (conversation: ChatConversation) => ChatUser | null;
  getUnreadCount: (conversationId: string) => number;
};

const ChatContext = createContext<ChatContextValue | null>(null);

function sortConversations(list: ChatConversation[]): ChatConversation[] {
  return [...list].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

function conversationKey(userA: string, userB: string): [string, string] {
  return userA < userB ? [userA, userB] : [userB, userA];
}

function daysAgoIso(days: number, hours = 10): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hours, 0, 0, 0);
  return d.toISOString();
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>(() =>
    mockConversations.map((conv) => ({
      ...conv,
      messages: [...conv.messages],
    })),
  );
  const [lastReadAt, setLastReadAt] = useState<LastReadMap>(() => ({
    'conv-soilsage': daysAgoIso(1, 15),
    'conv-hydroharry': daysAgoIso(2, 16),
  }));
  const [extraUsers, setExtraUsers] = useState<ChatUser[]>([]);
  const [chatView, setChatView] = useState<'inbox' | 'conversation' | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const allUsers = useMemo(
    () => [...MOCK_CHAT_USERS, ...extraUsers],
    [extraUsers],
  );

  const currentUserName =
    user?.email?.split('@')[0] ?? user?.displayName ?? 'You';

  const markRead = useCallback((conversationId: string, at: string) => {
    setLastReadAt((prev) => {
      const current = prev[conversationId];
      if (current && new Date(at).getTime() <= new Date(current).getTime()) {
        return prev;
      }
      return { ...prev, [conversationId]: at };
    });
  }, []);

  const getUnreadCount = useCallback(
    (conversationId: string) => {
      const conv = conversations.find((c) => c.id === conversationId);
      if (!conv) return 0;
      const readAt = lastReadAt[conversationId];
      if (!readAt) return conv.messages.length;
      return conv.messages.filter(
        (msg) =>
          msg.senderId !== CURRENT_USER_ID &&
          new Date(msg.createdAt).getTime() > new Date(readAt).getTime(),
      ).length;
    },
    [conversations, lastReadAt],
  );

  const totalUnread = useMemo(
    () => conversations.reduce((sum, conv) => sum + getUnreadCount(conv.id), 0),
    [conversations, getUnreadCount],
  );

  const getConversation = useCallback(
    (conversationId: string) => conversations.find((c) => c.id === conversationId),
    [conversations],
  );

  const getOtherParticipant = useCallback(
    (conversation: ChatConversation): ChatUser | null => {
      const otherId = conversation.participantIds.find((id) => id !== CURRENT_USER_ID);
      if (!otherId) return null;
      return (
        allUsers.find((u) => u.id === otherId) ??
        getChatUserById(otherId) ?? {
          id: otherId,
          displayName: otherId.replace(/^user-/, '').replace(/-/g, ' '),
        }
      );
    },
    [allUsers],
  );

  const openInbox = useCallback(() => {
    setChatView('inbox');
    setActiveConversationId(null);
  }, []);

  const closeChat = useCallback(() => {
    setChatView(null);
    setActiveConversationId(null);
  }, []);

  const openConversation = useCallback(
    (conversationId: string) => {
      const conv = conversations.find((c) => c.id === conversationId);
      if (conv?.messages.length) {
        const last = conv.messages[conv.messages.length - 1];
        markRead(conversationId, last.createdAt);
      }
      setActiveConversationId(conversationId);
      setChatView('conversation');
    },
    [conversations, markRead],
  );

  const openChatWithUser = useCallback(
    (userId: string) => {
      const existing = conversations.find((conv) =>
        conv.participantIds.includes(userId),
      );
      if (existing) {
        openConversation(existing.id);
        return;
      }

      const newConv: ChatConversation = {
        id: `conv-${Date.now()}`,
        participantIds: conversationKey(CURRENT_USER_ID, userId),
        messages: [],
        updatedAt: new Date().toISOString(),
      };

      setConversations((prev) => sortConversations([newConv, ...prev]));
      setActiveConversationId(newConv.id);
      setChatView('conversation');
    },
    [conversations, openConversation],
  );

  const openChatWithAuthor = useCallback(
    (authorName: string) => {
      if (authorName.toLowerCase() === currentUserName.toLowerCase()) return;

      const known = getChatUserByDisplayName(authorName);
      const userId = known?.id ?? getChatUserIdForAuthorName(authorName);

      if (!known) {
        setExtraUsers((prev) => {
          if (prev.some((u) => u.id === userId)) return prev;
          return [...prev, { id: userId, displayName: authorName }];
        });
      }

      openChatWithUser(userId);
    },
    [currentUserName, openChatWithUser],
  );

  const sendMessage = useCallback(
    (conversationId: string, body: string) => {
      const trimmed = body.trim();
      if (!trimmed) return;

      const message: ChatMessage = {
        id: `msg-${Date.now()}`,
        senderId: CURRENT_USER_ID,
        body: trimmed,
        createdAt: new Date().toISOString(),
      };

      setConversations((prev) =>
        sortConversations(
          prev.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, message],
                  updatedAt: message.createdAt,
                }
              : conv,
          ),
        ),
      );

      markRead(conversationId, message.createdAt);
    },
    [markRead],
  );

  const value = useMemo<ChatContextValue>(
    () => ({
      currentUserId: CURRENT_USER_ID,
      currentUserName,
      users: allUsers,
      conversations: sortConversations(conversations),
      totalUnread,
      chatView,
      activeConversationId,
      openInbox,
      closeChat,
      openConversation,
      openChatWithUser,
      openChatWithAuthor,
      sendMessage,
      getConversation,
      getOtherParticipant,
      getUnreadCount,
    }),
    [
      allUsers,
      currentUserName,
      conversations,
      totalUnread,
      chatView,
      activeConversationId,
      openInbox,
      closeChat,
      openConversation,
      openChatWithUser,
      openChatWithAuthor,
      sendMessage,
      getConversation,
      getOtherParticipant,
      getUnreadCount,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return ctx;
}
