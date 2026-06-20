import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import GlassCard from './GlassCard';
import { FORUM, formatRelativeTime } from './communityPostShared';
import type { AppNotification, NotificationKind } from '../types/notification';

type NotificationCardProps = {
  notification: AppNotification;
  onPress?: (notification: AppNotification) => void;
};

type KindConfig = {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

const KIND_CONFIG: Record<NotificationKind, KindConfig> = {
  follow: {
    icon: 'person-add-outline',
    color: '#3861C9',
  },
  like: {
    icon: 'heart',
    color: FORUM.heart,
  },
  comment: {
    icon: 'chatbubble-outline',
    color: FORUM.accent,
  },
  machine_alert: {
    icon: 'warning-outline',
    color: '#E67E22',
  },
};

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
        <View style={[styles.row, !detail && styles.rowSingleLine]}>
          <View style={[styles.iconWrap, { backgroundColor: `${config.color}33` }]}>
            <Ionicons name={config.icon} size={20} color={config.color} />
          </View>

          <View style={styles.body}>
            <View style={styles.topRow}>
              <View style={[styles.messageWrap, !detail && styles.messageWrapSingleLine]}>
                <Text
                  style={[styles.message, isUrgent && styles.messageUrgent]}
                  numberOfLines={2}
                >
                  {message}
                </Text>
              </View>
              <View style={styles.metaRight}>
                <Text style={styles.time}>{formatRelativeTime(notification.createdAt)}</Text>
                {!notification.read && (
                  <View style={styles.newBadge}>
                    <Text style={styles.newText}>NEW</Text>
                  </View>
                )}
              </View>
            </View>

            {detail ? (
              <Text style={styles.detail} numberOfLines={2}>
                {detail}
              </Text>
            ) : null}
          </View>
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
  rowSingleLine: {
    alignItems: 'center',
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  messageWrap: {
    flex: 1,
  },
  messageWrapSingleLine: {
    minHeight: 40,
    justifyContent: 'center',
  },
  metaRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
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
  newBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(0,141,65,0.22)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,141,65,0.4)',
  },
  newText: {
    color: 'rgba(180,255,210,0.95)',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
