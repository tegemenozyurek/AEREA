import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CommunityPostCard from '../components/CommunityPostCard';
import CreatePostModal from '../components/CreatePostModal';
import { useCommunity } from '../contexts/CommunityContext';
import { useChat } from '../contexts/ChatContext';
import PostCommentsScreen from './PostCommentsScreen';
import ChatListScreen from './ChatListScreen';
import ChatScreen from './ChatScreen';
import type { CommunityPost } from '../types/community';

type SectionItem = CommunityPost & { listKey: string };
type FeedTab = 'hot' | 'new';

type Section = {
  key: string;
  title: string;
  data: SectionItem[];
};

export default function CommunityScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const { hotPosts, latestPosts, refreshing, refresh, createPost, commentsPostId, closeComments } =
    useCommunity();
  const { chatView, activeConversationId, openInbox, closeChat, totalUnread } = useChat();
  const [createVisible, setCreateVisible] = useState(false);
  const [feedTab, setFeedTab] = useState<FeedTab>('hot');

  const activePosts = feedTab === 'hot' ? hotPosts : latestPosts;

  const sections = useMemo<Section[]>(
    () => [
      {
        key: feedTab,
        title: feedTab === 'hot' ? 'Hot' : 'New',
        data: activePosts.map((post) => ({
          ...post,
          listKey: `${feedTab}-${post.id}`,
        })),
      },
    ],
    [activePosts, feedTab],
  );

  const handleSearch = () => {
    Alert.alert(
      'Search',
      'Search for users, topics, and posts — coming soon.',
    );
  };

  const renderItem = useCallback(
    ({ item }: { item: SectionItem }) => (
      <View style={[styles.postWrap, { width: screenWidth }]}>
        <CommunityPostCard post={item} />
      </View>
    ),
    [screenWidth],
  );

  const keyExtractor = useCallback((item: SectionItem) => item.listKey, []);

  const ListHeader = useCallback(
    () => (
      <View style={[styles.listHeader, { width: screenWidth }]}>
        <View style={styles.sortRow}>
          <TouchableOpacity
            style={[styles.sortChip, feedTab === 'hot' && styles.sortChipActive]}
            onPress={() => setFeedTab('hot')}
          >
            <Ionicons
              name="flame"
              size={15}
              color={feedTab === 'hot' ? '#fff' : 'rgba(255,255,255,0.6)'}
            />
            <Text
              style={[
                styles.sortText,
                feedTab === 'hot' && styles.sortTextActive,
              ]}
            >
              Hot
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortChip, feedTab === 'new' && styles.sortChipActive]}
            onPress={() => setFeedTab('new')}
          >
            <Ionicons
              name="time-outline"
              size={15}
              color={feedTab === 'new' ? '#fff' : 'rgba(255,255,255,0.6)'}
            />
            <Text
              style={[
                styles.sortText,
                feedTab === 'new' && styles.sortTextActive,
              ]}
            >
              New
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [feedTab, screenWidth],
  );

  if (commentsPostId) {
    return (
      <PostCommentsScreen
        postId={commentsPostId}
        onBack={closeComments}
      />
    );
  }

  if (chatView === 'conversation' && activeConversationId) {
    return (
      <ChatScreen
        conversationId={activeConversationId}
        onBack={() => openInbox()}
      />
    );
  }

  if (chatView === 'inbox') {
    return <ChatListScreen onBack={closeChat} />;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { width: screenWidth }]} edges={['top']}>
      <View style={[styles.header, { width: screenWidth }]}>
        <Text style={styles.headerTitle}>Forum</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            activeOpacity={0.7}
            onPress={openInbox}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Messages"
          >
            <Ionicons name="chatbubble-outline" size={20} color="#fff" />
            {totalUnread > 0 && (
              <View style={styles.unreadDot}>
                <Text style={styles.unreadDotText}>
                  {totalUnread > 9 ? '9+' : totalUnread}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            activeOpacity={0.7}
            onPress={handleSearch}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Search forum"
          >
            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            activeOpacity={0.7}
            onPress={() => setCreateVisible(true)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Create post"
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <SectionList
        style={[styles.list, { width: screenWidth }]}
        sections={sections}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void refresh()}
            tintColor="#fff"
            colors={['#008D41']}
          />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No posts yet. Create the first one!</Text>
        }
      />

      <CreatePostModal
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
        onSubmit={createPost}
      />
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
  headerActions: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF6B8A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.35)',
  },
  unreadDotText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  list: {
    flex: 1,
    width: '100%',
  },
  listContent: {
    paddingBottom: 100,
    paddingTop: 4,
  },
  postWrap: {
    alignSelf: 'stretch',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  listHeader: {
    gap: 0,
    marginBottom: 0,
    width: '100%',
  },
  sortRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    width: '100%',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.22)',
    marginBottom: 4,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  sortChipActive: {
    backgroundColor: '#008D41',
    borderColor: '#008D41',
  },
  sortText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    fontWeight: '600',
  },
  sortTextActive: {
    color: '#fff',
  },
  empty: {
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 15,
  },
});
