import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LikeControls from './LikeControls';

type PostActionBarProps = {
  likeCount: number;
  liked: boolean;
  commentCount: number;
  onToggleLike: () => void;
  onOpenComments: () => void;
};

const ICON_SIZE = 24;

export default function PostActionBar({
  likeCount,
  liked,
  commentCount,
  onToggleLike,
  onOpenComments,
}: PostActionBarProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconRow}>
        <LikeControls
          likeCount={likeCount}
          liked={liked}
          onToggleLike={onToggleLike}
          iconOnly
        />
        <View style={styles.inlineGroup}>
          <TouchableOpacity
            style={styles.iconHit}
            onPress={onOpenComments}
            activeOpacity={0.7}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel={`${commentCount} comments`}
          >
            <Ionicons
              name="chatbubble-outline"
              size={ICON_SIZE}
              color="#FFFFFF"
            />
          </TouchableOpacity>
          <Text style={styles.iconCount}>{commentCount}</Text>
        </View>
        <TouchableOpacity
          style={styles.iconHit}
          activeOpacity={0.7}
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel="Share"
        >
          <Ionicons name="share-outline" size={ICON_SIZE} color="#FFFFFF" />
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
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 14,
  },
  inlineGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconHit: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCount: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    lineHeight: ICON_SIZE,
  },
});
