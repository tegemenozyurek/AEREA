import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CommentItem from '../components/CommentItem';
import { FORUM, photoPostStyles, PostMeta, RADIUS } from '../components/communityPostShared';
import GlassCard from '../components/GlassCard';
import PhotoCarousel from '../components/PhotoCarousel';
import { useCommunity } from '../contexts/CommunityContext';
import { countComments } from '../utils/comments';

type PostCommentsScreenProps = {
  postId: string;
  onBack: () => void;
};

export default function PostCommentsScreen({
  postId,
  onBack,
}: PostCommentsScreenProps) {
  const { width: screenWidth } = useWindowDimensions();
  const { posts, addComment } = useCommunity();
  const [draft, setDraft] = useState('');
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    authorName: string;
  } | null>(null);

  const post = posts.find((p) => p.id === postId);
  if (!post) {
    return (
      <SafeAreaView style={[styles.safeArea, { width: screenWidth }]} edges={['top']}>
        <View style={[styles.header, { width: screenWidth }]}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Comments</Text>
        </View>
        <View style={styles.missing}>
          <Text style={styles.missingText}>Post not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalComments = countComments(post.comments);

  const handleSubmit = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    addComment(post.id, trimmed, replyingTo?.id);
    setDraft('');
    setReplyingTo(null);
  };

  const handleReply = (commentId: string, authorName: string) => {
    setReplyingTo({ id: commentId, authorName });
  };

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
        <Text style={styles.headerTitle}>Comments</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
        <ScrollView
          style={[styles.flex, { width: screenWidth }]}
          contentContainerStyle={[styles.scrollContent, { width: screenWidth }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <GlassCard style={styles.postPreview}>
            <PostMeta
              topic={post.topic}
              authorName={post.authorName}
              createdAt={post.createdAt}
            />
            <View style={photoPostStyles.block}>
              <Text style={styles.postTitle}>{post.title}</Text>

              {post.photoUris.length > 0 && (
                <View style={photoPostStyles.photoSection}>
                  <PhotoCarousel uris={post.photoUris} height={220} />
                </View>
              )}

              {(post.photoUris.length === 0 || post.body !== post.title) && (
                <Text style={styles.postBody}>{post.body}</Text>
              )}
            </View>

            <Text style={styles.commentCount}>
              {totalComments} comment{totalComments !== 1 ? 's' : ''}
            </Text>
          </GlassCard>

          {post.comments.length === 0 ? (
            <Text style={styles.empty}>No comments yet. Be the first!</Text>
          ) : (
            post.comments.map((comment, index) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                isLastSibling={index === post.comments.length - 1}
                onReply={handleReply}
              />
            ))
          )}
        </ScrollView>

        <View style={[styles.inputBar, { width: screenWidth }]}>
          {replyingTo && (
            <View style={styles.replyingBanner}>
              <Text style={styles.replyingText}>
                Replying to <Text style={styles.replyingName}>{replyingTo.authorName}</Text>
              </Text>
              <TouchableOpacity
                onPress={() => setReplyingTo(null)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Cancel reply"
              >
                <Ionicons name="close" size={18} color={FORUM.muted} />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={
              replyingTo
                ? `Reply to ${replyingTo.authorName}...`
                : 'Add a comment...'
            }
            placeholderTextColor="rgba(255,255,255,0.45)"
            value={draft}
            onChangeText={setDraft}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.submit, !draft.trim() && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={!draft.trim()}
          >
            <Text style={styles.submitText}>
              {replyingTo ? 'Reply' : 'Post'}
            </Text>
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
  scrollContent: {
    paddingBottom: 24,
    paddingTop: 4,
    paddingHorizontal: 12,
    gap: 10,
  },
  postPreview: {
    marginBottom: 4,
    overflow: 'hidden',
    paddingBottom: 12,
    alignSelf: 'stretch',
  },
  postTitle: {
    color: FORUM.title,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    paddingHorizontal: 14,
    marginTop: 4,
    marginBottom: 0,
  },
  postBody: {
    color: FORUM.body,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 14,
    marginTop: 0,
  },
  commentCount: {
    color: FORUM.muted,
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 14,
    marginTop: 10,
  },
  empty: {
    color: FORUM.muted,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 32,
  },
  replyingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  replyingText: {
    color: FORUM.muted,
    fontSize: 12,
  },
  replyingName: {
    color: '#fff',
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  inputBar: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: FORUM.border,
    backgroundColor: 'rgba(255,255,255,0.06)',
    width: '100%',
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
    fontSize: 14,
  },
  submit: {
    backgroundColor: FORUM.accent,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: RADIUS.inner,
  },
  submitDisabled: {
    opacity: 0.45,
  },
  submitText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
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
