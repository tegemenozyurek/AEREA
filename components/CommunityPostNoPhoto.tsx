import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useCommunity } from '../contexts/CommunityContext';
import { useChat } from '../contexts/ChatContext';
import type { CommunityPost } from '../types/community';
import { countComments } from '../utils/comments';
import { cardStyles, PostMeta } from './communityPostShared';
import PostActionBar from './PostActionBar';

type CommunityPostNoPhotoProps = {
  post: CommunityPost;
};

export default function CommunityPostNoPhoto({ post }: CommunityPostNoPhotoProps) {
  const { toggleLike, isLiked, openComments } = useCommunity();
  const { openChatWithAuthor } = useChat();

  return (
    <View style={cardStyles.inner}>
      <PostMeta
        topic={post.topic}
        authorName={post.authorName}
        createdAt={post.createdAt}
        onAuthorPress={openChatWithAuthor}
      />

      <View style={cardStyles.content}>
        <Text style={cardStyles.title}>{post.title}</Text>
        <Text style={cardStyles.body} numberOfLines={6}>
          {post.body}
        </Text>
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
