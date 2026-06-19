import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import CommunityPostCard from './CommunityPostCard';
import DeletePostModal from './DeletePostModal';
import ProfileHeader from './ProfileHeader';
import { useCommunity } from '../contexts/CommunityContext';
import { PROFILE_SELF_USER_ID } from '../data/mockProfilePosts';
import PostCommentsScreen from '../screens/PostCommentsScreen';
import type { CommunityPost } from '../types/community';
import { useResponsive } from '../utils/responsive';

type ProfileHeaderProps = React.ComponentProps<typeof ProfileHeader>;

type Props = {
  userId: string;
  authorName: string;
  headerProps: ProfileHeaderProps;
};

export default function ProfileView({ userId, authorName, headerProps }: Props) {
  const { getProfilePosts, deleteProfilePost, commentsPostId, closeComments } = useCommunity();
  const r = useResponsive();
  const [postToDelete, setPostToDelete] = useState<CommunityPost | null>(null);
  const isOwnProfile = userId === PROFILE_SELF_USER_ID;
  const posts = useMemo(
    () => getProfilePosts(userId, authorName),
    [authorName, getProfilePosts, userId],
  );

  const handleConfirmDelete = useCallback(() => {
    if (!postToDelete) {
      return;
    }
    deleteProfilePost(postToDelete.id);
    setPostToDelete(null);
  }, [deleteProfilePost, postToDelete]);

  const renderItem = useCallback(
    ({ item }: { item: CommunityPost }) => (
      <Pressable
        style={[
          styles.postWrap,
          {
            paddingHorizontal: r.horizontalPadding,
            marginBottom: r.scale(8),
          },
        ]}
        onLongPress={isOwnProfile ? () => setPostToDelete(item) : undefined}
        delayLongPress={400}
      >
        <CommunityPostCard post={item} />
      </Pressable>
    ),
    [isOwnProfile, r],
  );

  if (commentsPostId) {
    return <PostCommentsScreen postId={commentsPostId} onBack={closeComments} />;
  }

  return (
    <View style={styles.root}>
      <ProfileHeader {...headerProps} />
      <FlatList
        style={styles.list}
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: r.scale(12),
            paddingBottom: r.scale(100),
            maxWidth: r.contentMaxWidth,
            alignSelf: 'center',
            width: '100%',
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={posts.length > 0}
        alwaysBounceVertical={posts.length > 0}
      />
      <DeletePostModal
        visible={postToDelete !== null}
        post={postToDelete}
        onClose={() => setPostToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  postWrap: {
    alignSelf: 'stretch',
  },
});
