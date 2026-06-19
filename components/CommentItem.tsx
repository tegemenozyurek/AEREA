import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { CommunityComment } from '../types/community';
import { formatRelativeTime, FORUM } from './communityPostShared';
import GlassCard from './GlassCard';

type CommentItemProps = {
  comment: CommunityComment;
  depth?: number;
  isLastSibling?: boolean;
  ancestorContinuations?: boolean[];
  onReply: (commentId: string, authorName: string) => void;
};

const THREAD_COL = 18;
const DOT_SIZE = 7;
const JOINT_Y = 22;
const LINE_COLOR = 'rgba(255,255,255,0.28)';

export default function CommentItem({
  comment,
  depth = 0,
  isLastSibling = true,
  ancestorContinuations = [],
  onReply,
}: CommentItemProps) {
  const replies = comment.replies ?? [];

  return (
    <View style={styles.threadRoot}>
      <View style={styles.lineColumns}>
        {ancestorContinuations.map((continueLine, index) => (
          <View key={`guide-${index}`} style={styles.threadCol}>
            {continueLine ? <View style={styles.continuationLine} /> : null}
          </View>
        ))}

        {depth > 0 && (
          <View style={styles.threadCol}>
            <View style={styles.stemTop} />
            <View style={styles.joint}>
              <View style={styles.stemArm} />
              <View style={styles.threadDot} />
            </View>
            {!isLastSibling && <View style={styles.stemBottom} />}
          </View>
        )}
      </View>

      <View style={styles.body}>
        <GlassCard style={[styles.commentCard, depth > 0 && styles.nestedCard]}>
          <View style={styles.commentMeta}>
            <Text style={styles.author}>{comment.authorName}</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.time}>{formatRelativeTime(comment.createdAt)}</Text>
          </View>
          <Text style={styles.commentBody}>{comment.body}</Text>
          <TouchableOpacity
            style={styles.replyBtn}
            onPress={() => onReply(comment.id, comment.authorName)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`Reply to ${comment.authorName}`}
          >
            <Text style={styles.replyText}>Reply</Text>
          </TouchableOpacity>
        </GlassCard>

        {replies.map((reply, index) => (
          <CommentItem
            key={reply.id}
            comment={reply}
            depth={depth + 1}
            isLastSibling={index === replies.length - 1}
            ancestorContinuations={[...ancestorContinuations, !isLastSibling]}
            onReply={onReply}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  threadRoot: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 8,
  },
  lineColumns: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  threadCol: {
    width: THREAD_COL,
    position: 'relative',
    alignItems: 'center',
  },
  continuationLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
    backgroundColor: LINE_COLOR,
    left: THREAD_COL / 2,
  },
  stemTop: {
    position: 'absolute',
    top: 0,
    left: THREAD_COL / 2,
    width: StyleSheet.hairlineWidth,
    height: JOINT_Y,
    backgroundColor: LINE_COLOR,
  },
  joint: {
    position: 'absolute',
    top: JOINT_Y - DOT_SIZE / 2,
    left: THREAD_COL / 2,
    right: 0,
    height: DOT_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stemArm: {
    height: StyleSheet.hairlineWidth,
    width: THREAD_COL / 2 - 1,
    backgroundColor: LINE_COLOR,
  },
  threadDot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.65)',
  },
  stemBottom: {
    position: 'absolute',
    top: JOINT_Y + DOT_SIZE / 2,
    bottom: 0,
    left: THREAD_COL / 2,
    width: StyleSheet.hairlineWidth,
    backgroundColor: LINE_COLOR,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  commentCard: {
    padding: 14,
    alignSelf: 'stretch',
  },
  nestedCard: {
    marginTop: 0,
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  author: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  dot: {
    color: FORUM.muted,
    fontSize: 12,
  },
  time: {
    color: FORUM.muted,
    fontSize: 12,
  },
  commentBody: {
    color: FORUM.body,
    fontSize: 14,
    lineHeight: 20,
  },
  replyBtn: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingVertical: 2,
  },
  replyText: {
    color: FORUM.muted,
    fontSize: 12,
    fontWeight: '600',
  },
});
