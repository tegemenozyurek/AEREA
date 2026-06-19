import React from 'react';
import { Text, View } from 'react-native';
import { useCommunity } from '../contexts/CommunityContext';
import type { CommunityPost } from '../types/community';
import { countComments } from '../utils/comments';
import { cardStyles, photoPostStyles, PostMeta } from './communityPostShared';
import PhotoCarousel from './PhotoCarousel';
import PostActionBar from './PostActionBar';

type CommunityPostWithPhotoProps = {
  post: CommunityPost;
};

export default function CommunityPostWithPhoto({
  post,
}: CommunityPostWithPhotoProps) {
  const { toggleLike, isLiked, openComments } = useCommunity();

  return (
    <View style={cardStyles.inner}>
      <PostMeta
        topic={post.topic}
        authorName={post.authorName}
        createdAt={post.createdAt}
      />

      <View style={photoPostStyles.block}>
        <View style={photoPostStyles.titleSection}>
          <Text style={[cardStyles.title, photoPostStyles.title]}>{post.title}</Text>
        </View>

        <View style={photoPostStyles.photoSection}>
          <PhotoCarousel uris={post.photoUris} height={260} />
        </View>

        {post.body !== post.title && (
          <View style={photoPostStyles.bodySection}>
            <Text style={[cardStyles.body, photoPostStyles.bodyText]} numberOfLines={4}>
              {post.body}
            </Text>
          </View>
        )}
      </View>

      <PostActionBar
        likeCount={post.likeCount}
        liked={isLiked(post.id)}
        commentCount={countComments(post.comments)}
        onToggleLike={() => toggleLike(post.id)}
        onOpenComments={() => openComments(post.id)}
      />
    </View>
  );
}
