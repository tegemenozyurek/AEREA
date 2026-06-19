import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { mockCommunityPosts } from '../data/mockCommunityPosts';
import { isProfilePostId, mockProfilePosts } from '../data/mockProfilePosts';
import type { CommunityPost, CreatePostInput } from '../types/community';
import { addReplyToComment, cloneComments } from '../utils/comments';
import { useAuth } from './AuthContext';

type UserLikes = Record<string, boolean>;

type CommunityContextValue = {
  posts: CommunityPost[];
  hotPosts: CommunityPost[];
  latestPosts: CommunityPost[];
  refreshing: boolean;
  commentsPostId: string | null;
  toggleLike: (postId: string) => void;
  addComment: (postId: string, body: string, parentCommentId?: string) => void;
  createPost: (input: CreatePostInput) => void;
  refresh: () => Promise<void>;
  isLiked: (postId: string) => boolean;
  openComments: (postId: string) => void;
  closeComments: () => void;
  getProfilePosts: (userId: string, authorName?: string) => CommunityPost[];
  deleteProfilePost: (postId: string) => void;
};

const CommunityContext = createContext<CommunityContextValue | null>(null);

function sortHot(posts: CommunityPost[]): CommunityPost[] {
  return [...posts].sort((a, b) => b.likeCount - a.likeCount).slice(0, 10);
}

function sortLatest(posts: CommunityPost[]): CommunityPost[] {
  return [...posts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function CommunityProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>(() =>
    [...mockCommunityPosts, ...mockProfilePosts].map((post) => ({
      ...post,
      comments: cloneComments(post.comments),
    })),
  );
  const [userLikes, setUserLikes] = useState<UserLikes>({});
  const [refreshing, setRefreshing] = useState(false);
  const [commentsPostId, setCommentsPostId] = useState<string | null>(null);

  const authorName =
    user?.email?.split('@')[0] ?? user?.displayName ?? 'You';

  const feedPosts = useMemo(
    () => posts.filter((post) => !isProfilePostId(post.id)),
    [posts],
  );

  const hotPosts = useMemo(() => sortHot(feedPosts), [feedPosts]);
  const latestPosts = useMemo(() => sortLatest(feedPosts), [feedPosts]);

  const getProfilePosts = useCallback(
    (userId: string, profileAuthorName?: string) => {
      const prefix = `profile-${userId}-`;
      return posts
        .filter((post) => post.id.startsWith(prefix))
        .sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .map((post) =>
          profileAuthorName ? { ...post, authorName: profileAuthorName } : post,
        );
    },
    [posts],
  );

  const isLiked = useCallback(
    (postId: string) => Boolean(userLikes[postId]),
    [userLikes],
  );

  const toggleLike = useCallback(
    (postId: string) => {
      const liked = Boolean(userLikes[postId]);

      setPosts((postList) =>
        postList.map((post) =>
          post.id === postId
            ? { ...post, likeCount: post.likeCount + (liked ? -1 : 1) }
            : post,
        ),
      );

      setUserLikes((prev) => {
        if (liked) {
          const { [postId]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [postId]: true };
      });
    },
    [userLikes],
  );

  const addComment = useCallback(
    (postId: string, body: string, parentCommentId?: string) => {
      const trimmed = body.trim();
      if (!trimmed) return;

      const comment = {
        id: `comment-${Date.now()}`,
        authorName,
        body: trimmed,
        createdAt: new Date().toISOString(),
        replies: [],
      };

      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post;

          if (parentCommentId) {
            return {
              ...post,
              comments: addReplyToComment(post.comments, parentCommentId, comment),
            };
          }

          return {
            ...post,
            comments: [...post.comments, comment],
          };
        }),
      );
    },
    [authorName],
  );

  const createPost = useCallback(
    (input: CreatePostInput) => {
      const post: CommunityPost = {
        id: `post-${Date.now()}`,
        topic: input.topic,
        title: input.title.trim(),
        body: input.body.trim(),
        photoUris: input.photoUris,
        authorName,
        likeCount: 0,
        comments: [],
        createdAt: new Date().toISOString(),
      };
      setPosts((prev) => [post, ...prev]);
    },
    [authorName],
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setRefreshing(false);
  }, []);

  const openComments = useCallback((postId: string) => {
    setCommentsPostId(postId);
  }, []);

  const closeComments = useCallback(() => {
    setCommentsPostId(null);
  }, []);

  const deleteProfilePost = useCallback((postId: string) => {
    if (!isProfilePostId(postId)) {
      return;
    }

    setPosts((prev) => prev.filter((post) => post.id !== postId));
    setUserLikes((prev) => {
      if (!prev[postId]) {
        return prev;
      }
      const { [postId]: _, ...rest } = prev;
      return rest;
    });
    setCommentsPostId((current) => (current === postId ? null : current));
  }, []);

  const value = useMemo<CommunityContextValue>(
    () => ({
      posts,
      hotPosts,
      latestPosts,
      refreshing,
      commentsPostId,
      toggleLike,
      addComment,
      createPost,
      refresh,
      isLiked,
      openComments,
      closeComments,
      getProfilePosts,
      deleteProfilePost,
    }),
    [
      posts,
      hotPosts,
      latestPosts,
      refreshing,
      commentsPostId,
      toggleLike,
      addComment,
      createPost,
      refresh,
      isLiked,
      openComments,
      closeComments,
      getProfilePosts,
      deleteProfilePost,
    ],
  );

  return (
    <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>
  );
}

export function useCommunity(): CommunityContextValue {
  const ctx = useContext(CommunityContext);
  if (!ctx) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return ctx;
}
