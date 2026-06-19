import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { CommunityTopic } from '../types/community';

export const FORUM = {
  card: 'rgba(0,0,0,0.16)',
  border: 'rgba(255,255,255,0.22)',
  glassBorder: 'rgba(255,255,255,0.28)',
  title: '#FFFFFF',
  body: 'rgba(255,255,255,0.85)',
  muted: 'rgba(255,255,255,0.55)',
  accent: '#008D41',
  heart: '#FF6B8A',
  inputBg: 'rgba(255,255,255,0.1)',
} as const;

export const RADIUS = {
  card: 16,
  inner: 12,
  sm: 10,
  pill: 20,
} as const;

const TOPIC_COLORS: Record<CommunityTopic, string> = {
  Question: '#3861C9',
  Advice: '#008D41',
  'My Experience': '#6D2B96',
};

export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo`;
}

export function TopicBadge({ topic }: { topic: CommunityTopic }) {
  return (
    <View style={[badgeStyles.badge, { backgroundColor: TOPIC_COLORS[topic] }]}>
      <Text style={badgeStyles.badgeText}>{topic}</Text>
    </View>
  );
}

type PostMetaProps = {
  topic: CommunityTopic;
  authorName: string;
  createdAt: string;
  onAuthorPress?: (authorName: string) => void;
};

export function PostMeta({ topic, authorName, createdAt, onAuthorPress }: PostMetaProps) {
  return (
    <View style={metaStyles.row}>
      <TopicBadge topic={topic} />
      <Text style={metaStyles.text}>
        {onAuthorPress ? (
          <Text style={metaStyles.authorLink} onPress={() => onAuthorPress(authorName)}>
            {authorName}
          </Text>
        ) : (
          <Text style={metaStyles.author}>{authorName}</Text>
        )}
        <Text style={metaStyles.dot}> · </Text>
        <Text style={metaStyles.time}>{formatRelativeTime(createdAt)}</Text>
      </Text>
    </View>
  );
}

export const cardStyles = StyleSheet.create({
  inner: {
    alignSelf: 'stretch',
  },
  content: {
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  title: {
    color: FORUM.title,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 6,
  },
  body: {
    color: FORUM.body,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: FORUM.border,
    marginTop: 4,
  },
});

export const photoPostStyles = StyleSheet.create({
  block: {
    gap: 20,
  },
  titleSection: {
    paddingHorizontal: 14,
  },
  title: {
    marginBottom: 0,
  },
  photoSection: {
    marginHorizontal: 12,
    borderRadius: RADIUS.inner,
    overflow: 'hidden',
  },
  bodySection: {
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  bodyText: {
    marginBottom: 0,
  },
});

const badgeStyles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

const metaStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 6,
  },
  text: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  author: {
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
  },
  authorLink: {
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  dot: {
    color: FORUM.muted,
  },
  time: {
    color: FORUM.muted,
  },
});
