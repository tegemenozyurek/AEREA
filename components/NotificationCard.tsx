import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import GlassCard from './GlassCard';
import { FORUM, formatRelativeTime, RADIUS } from './communityPostShared';
import type { AppNotification, NotificationKind } from '../types/notification';

type NotificationCardProps = {
  notification: AppNotification;
  onPress?: (notification: AppNotification) => void;
};

type KindConfig = {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  label: string;
};

const KIND_CONFIG: Record<NotificationKind, KindConfig> = {
  follow: {
    icon: 'person-add-outline',
    color: '#3861C9',
    label: 'Follow',
  },
  like: {
    icon: 'heart',
    color: FORUM.heart,
    label: 'Like',
  },
  comment: {
    icon: 'chatbubble-outline',
    color: FORUM.accent,
    label: 'Comment',
  },
  machine_alert: {
    icon: 'warning-outline',
    color: '#E67E22',
    label: 'Machine',
  },
};

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${Math.abs(hash) % 360}, 55%, 42%)`;
}

function buildMessage(notification: AppNotification): string {
  switch (notification.kind) {
    case 'follow':
      return `${notification.actorName ?? 'Someone'} followed you`;
    case 'like':
      return `${notification.actorName ?? 'Someone'} liked your post`;
    case 'comment':
      return `${notification.actorName ?? 'Someone'} commented on your post`;
    case 'machine_alert':
      if (notification.message) return notification.message;
      return `${notification.machineName ?? 'A machine'} needs attention`;
    default:
      return 'New notification';
  }
}

function buildDetail(notification: AppNotification): string | null {
  if (notification.kind === 'follow') return null;
  if (notification.kind === 'machine_alert') {
    return notification.machineName ?? null;
  }
  return notification.postTitle ? `"${notification.postTitle}"` : null;
}

export default function NotificationCard({ notification, onPress }: NotificationCardProps) {
  const config = KIND_CONFIG[notification.kind];
  const message = buildMessage(notification);
  const detail = buildDetail(notification);
  const isUrgent =
    notification.kind === 'machine_alert' &&
    typeof notification.metricValue === 'number' &&
    notification.metricValue <= 20;

  const showAvatar =
    notification.kind !== 'machine_alert' && notification.actorName;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress?.(notification)}
      disabled={!onPress}
    >
      <GlassCard
        style={[
          styles.card,
          !notification.read && styles.cardUnread,
          isUrgent && styles.cardUrgent,
        ]}
      >
        <View style={styles.row}>
          {showAvatar ? (
            <View
              style={[
                styles.avatar,
                { backgroundColor: avatarColor(notification.actorName!) },
              ]}
            >
              <Text style={styles.avatarText}>
                {notification.actorName!.charAt(0).toUpperCase()}
              </Text>
            </View>
          ) : (
            <View style={[styles.iconWrap, { backgroundColor: `${config.color}33` }]}>
              <Ionicons name={config.icon} size={20} color={config.color} />
            </View>
          )}

          <View style={styles.body}>
            <View style={styles.topRow}>
              <View style={[styles.kindBadge, { backgroundColor: `${config.color}28` }]}>
                <Text style={[styles.kindText, { color: config.color }]}>{config.label}</Text>
              </View>
              <Text style={styles.time}>{formatRelativeTime(notification.createdAt)}</Text>
            </View>

            <Text style={[styles.message, isUrgent && styles.messageUrgent]}>{message}</Text>

            {detail ? (
              <Text style={styles.detail} numberOfLines={2}>
                {detail}
              </Text>
            ) : null}
          </View>

          {!notification.read && <View style={styles.unreadDot} />}
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
  },
  cardUnread: {
    borderColor: 'rgba(255,255,255,0.32)',
  },
  cardUrgent: {
    borderColor: 'rgba(230,126,34,0.55)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  kindBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  kindText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  time: {
    color: FORUM.muted,
    fontSize: 11,
  },
  message: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  messageUrgent: {
    color: '#FFD4A8',
  },
  detail: {
    color: FORUM.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: FORUM.accent,
    marginTop: 4,
  },
});
