import React from 'react';
import type { CommunityPost } from '../types/community';
import CommunityPostNoPhoto from './CommunityPostNoPhoto';
import CommunityPostWithPhoto from './CommunityPostWithPhoto';
import GlassCard from './GlassCard';

type CommunityPostCardProps = {
  post: CommunityPost;
};

export default function CommunityPostCard({ post }: CommunityPostCardProps) {
  return (
    <GlassCard>
      {post.photoUris.length > 0 ? (
        <CommunityPostWithPhoto post={post} />
      ) : (
        <CommunityPostNoPhoto post={post} />
      )}
    </GlassCard>
  );
}
