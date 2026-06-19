import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FORUM } from './communityPostShared';

type LikeControlsProps = {
  likeCount: number;
  liked: boolean;
  onToggleLike: () => void;
  pill?: boolean;
  iconOnly?: boolean;
};

const formatNumber = (value: number) => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};


const ICON_SIZE = 24;

export default function LikeControls({
  likeCount,
  liked,
  onToggleLike,
  pill = false,
  iconOnly = false,
}: LikeControlsProps) {
  if (iconOnly) {
    return (
      <View style={styles.inlineGroup}>
        <TouchableOpacity
          style={styles.iconHit}
          onPress={onToggleLike}
          activeOpacity={0.7}
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel={liked ? 'Unlike post' : 'Like post'}
        >
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={ICON_SIZE}
            color={liked ? FORUM.heart : '#FFFFFF'}
          />
        </TouchableOpacity>
        <Text style={styles.iconCount}>{formatNumber(likeCount)}</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.action,
        pill && styles.pill,
        liked && styles.actionActive,
      ]}
      onPress={onToggleLike}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={liked ? 'Unlike post' : 'Like post'}
    >
      <Ionicons
        name={liked ? 'heart' : 'heart-outline'}
        size={17}
        color={liked ? FORUM.heart : 'rgba(255,255,255,0.75)'}
      />
      <Text style={[styles.actionText, liked && styles.actionTextActive]}>
        {formatNumber(likeCount)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: FORUM.border,
  },
  actionActive: {
    backgroundColor: 'rgba(255,107,138,0.15)',
  },
  actionText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '700',
  },
  actionTextActive: {
    color: FORUM.heart,
  },
});
