import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { FORUM } from './communityPostShared';
import NotificationCard from './NotificationCard';
import type { AppNotification } from '../types/notification';

const SWIPE_DELETE_THRESHOLD = 72;

type NotificationBoxProps = {
  notifications: AppNotification[];
  onNotificationPress?: (notification: AppNotification) => void;
  onDelete?: (id: string) => void;
  onDeleteAll?: () => void;
};

function SwipeToDeleteRow({
  onDelete,
  children,
}: {
  onDelete: () => void;
  children: React.ReactNode;
}) {
  const translateX = useSharedValue(0);

  const pan = Gesture.Pan()
    .activeOffsetX(-16)
    .failOffsetY([-14, 14])
    .onUpdate((event) => {
      if (event.translationX < 0) {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      if (event.translationX <= -SWIPE_DELETE_THRESHOLD) {
        translateX.value = withTiming(-500, { duration: 160 }, (finished) => {
          if (finished) {
            runOnJS(onDelete)();
          }
        });
        return;
      }
      translateX.value = withTiming(0, { duration: 160 });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.swipeRow, animatedStyle]}>{children}</Animated.View>
    </GestureDetector>
  );
}

function SwipeableNotificationRow({
  notification,
  onPress,
  onDelete,
}: {
  notification: AppNotification;
  onPress?: (notification: AppNotification) => void;
  onDelete?: (id: string) => void;
}) {
  if (!onDelete) {
    return <NotificationCard notification={notification} onPress={onPress} />;
  }

  return (
    <SwipeToDeleteRow onDelete={() => onDelete(notification.id)}>
      <NotificationCard notification={notification} onPress={onPress} />
    </SwipeToDeleteRow>
  );
}

export default function NotificationBox({
  notifications,
  onNotificationPress,
  onDelete,
  onDeleteAll,
}: NotificationBoxProps) {
  const canDeleteAll = notifications.length > 0;

  if (notifications.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="notifications-outline" size={40} color={FORUM.muted} />
        <Text style={styles.emptyTitle}>No notifications</Text>
        <Text style={styles.emptyText}>You're all caught up.</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      {onDeleteAll && (
        <View style={styles.toolbar}>
          <TouchableOpacity
            onPress={onDeleteAll}
            disabled={!canDeleteAll}
            activeOpacity={canDeleteAll ? 0.7 : 1}
            hitSlop={8}
            accessibilityLabel="Delete all notifications"
          >
            <Text style={[styles.deleteAll, !canDeleteAll && styles.deleteAllDisabled]}>
              DELETE
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {notifications.map((notification) => (
        <SwipeableNotificationRow
          key={notification.id}
          notification={notification}
          onPress={onNotificationPress}
          onDelete={onDelete}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: '100%',
    alignSelf: 'stretch',
  },
  swipeRow: {
    width: '100%',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  deleteAll: {
    color: '#FF8A8A',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  deleteAllDisabled: {
    color: 'rgba(255,255,255,0.28)',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginTop: 8,
  },
  emptyText: {
    color: FORUM.muted,
    fontSize: 14,
  },
});
