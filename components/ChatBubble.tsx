import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FORUM, formatRelativeTime, RADIUS } from './communityPostShared';

type ChatBubbleProps = {
  body: string;
  createdAt: string;
  isOwn: boolean;
  showTimestamp?: boolean;
};

export default function ChatBubble({
  body,
  createdAt,
  isOwn,
  showTimestamp = true,
}: ChatBubbleProps) {
  return (
    <View style={[styles.row, isOwn ? styles.rowOwn : styles.rowOther]}>
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        <Text style={styles.body}>{body}</Text>
        {showTimestamp && (
          <Text style={[styles.time, isOwn && styles.timeOwn]}>
            {formatRelativeTime(createdAt)}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  rowOwn: {
    justifyContent: 'flex-end',
  },
  rowOther: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.inner,
    borderWidth: StyleSheet.hairlineWidth,
  },
  bubbleOwn: {
    backgroundColor: FORUM.accent,
    borderColor: 'rgba(255,255,255,0.15)',
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: FORUM.border,
    borderBottomLeftRadius: 4,
  },
  body: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 21,
  },
  time: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  timeOwn: {
    color: 'rgba(255,255,255,0.7)',
    alignSelf: 'flex-end',
  },
});
