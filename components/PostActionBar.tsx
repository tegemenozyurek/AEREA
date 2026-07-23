import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FORUM } from './communityPostShared';

type PostActionBarProps = {
  likeCount: number;
  liked: boolean;
  commentCount: number;
  onToggleLike: () => void;
  onOpenComments: () => void;
};

const ICON_SIZE = 22;
const SLOT = 24;

const formatNumber = (value: number) =>
  value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export default function PostActionBar({
  likeCount,
  liked,
  commentCount,
  onToggleLike,
  onOpenComments,
}: PostActionBarProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.action}
          onPress={onToggleLike}
          activeOpacity={0.7}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={liked ? 'Unlike post' : 'Like post'}
        >
          <View style={styles.iconSlot}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={ICON_SIZE}
              color={liked ? FORUM.heart : '#FFFFFF'}
            />
          </View>
          <Text style={styles.count}>{formatNumber(likeCount)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.action}
          onPress={onOpenComments}
          activeOpacity={0.7}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={`${commentCount} comments`}
        >
          <View style={styles.iconSlot}>
            <Ionicons name="chatbubble-outline" size={ICON_SIZE} color="#FFFFFF" />
          </View>
          <Text style={styles.count}>{formatNumber(commentCount)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.action}
          activeOpacity={0.7}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="Share"
        >
          <View style={styles.iconSlot}>
            <Ionicons name="share-outline" size={ICON_SIZE} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: SLOT,
  },
  iconSlot: {
    width: SLOT,
    height: SLOT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 16,
    includeFontPadding: false,
  },
});
