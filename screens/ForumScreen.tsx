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
import CommunityPostCard from '../components/CommunityPostCard';
import CreatePostModal from '../components/CreatePostModal';
import { useCommunity } from '../contexts/CommunityContext';
import { useCommunityScrollHandler } from '../contexts/CommunityScrollContext';
import PostCommentsScreen from './PostCommentsScreen';
import type { CommunityPost } from '../types/community';

type SectionItem = CommunityPost & { listKey: string };
type FeedTab = 'hot' | 'new';

type Section = {
  key: string;
  title: string;
  data: SectionItem[];
};

export default function ForumScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const { hotPosts, latestPosts, refreshing, refresh, createPost, commentsPostId, closeComments } =
    useCommunity();
  const [createVisible, setCreateVisible] = useState(false);
  const [feedTab, setFeedTab] = useState<FeedTab>('hot');
  const onScroll = useCommunityScrollHandler();

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
    Alert.alert('Search', 'Search for users, topics, and posts — coming soon.');
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
        <View style={styles.toolbar}>
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
              <Text style={[styles.sortText, feedTab === 'hot' && styles.sortTextActive]}>
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
              <Text style={[styles.sortText, feedTab === 'new' && styles.sortTextActive]}>
                New
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.toolbarActions}>
            <TouchableOpacity
              style={styles.toolbarButton}
              onPress={handleSearch}
              hitSlop={8}
              accessibilityLabel="Search forum"
            >
              <Ionicons name="search" size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.toolbarButton}
              onPress={() => setCreateVisible(true)}
              hitSlop={8}
              accessibilityLabel="Create post"
            >
              <Ionicons name="add" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    ),
    [feedTab, screenWidth],
  );

  if (commentsPostId) {
    return <PostCommentsScreen postId={commentsPostId} onBack={closeComments} />;
  }

  return (
    <View style={styles.fill}>
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
        onScroll={onScroll}
        scrollEventThrottle={16}
      />

      <CreatePostModal
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
        onSubmit={createPost}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    alignSelf: 'stretch',
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
    width: '100%',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.22)',
    marginBottom: 4,
  },
  sortRow: {
    flexDirection: 'row',
    gap: 8,
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
  toolbarActions: {
    flexDirection: 'row',
    gap: 8,
  },
  toolbarButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  empty: {
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 15,
  },
});
