import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FORUM } from './communityPostShared';
import NotificationCard from './NotificationCard';
import type { AppNotification } from '../types/notification';

type NotificationBoxProps = {
  notifications: AppNotification[];
  onNotificationPress?: (notification: AppNotification) => void;
  onMarkAllRead?: () => void;
};

export default function NotificationBox({
  notifications,
  onNotificationPress,
  onMarkAllRead,
}: NotificationBoxProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;
  const canMarkAllRead = unreadCount > 0;

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
      {onMarkAllRead && (
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={onMarkAllRead}
            disabled={!canMarkAllRead}
            activeOpacity={canMarkAllRead ? 0.7 : 1}
            hitSlop={8}
          >
            <Text style={[styles.markRead, !canMarkAllRead && styles.markReadDisabled]}>
              Mark all read
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onPress={onNotificationPress}
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  markRead: {
    color: FORUM.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  markReadDisabled: {
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
