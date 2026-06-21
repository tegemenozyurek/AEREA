import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import GlassCard from './GlassCard';
import type { RoomAlertIssue, RoomAlertSummary } from '../utils/roomEnvironmentAlerts';
import { useResponsive } from '../utils/responsive';

type Props = {
  summaries: RoomAlertSummary[];
  onDismiss: () => void;
};

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const RECOMMENDATION_ICONS: Record<RoomAlertIssue, IoniconName> = {
  add_water: 'water-outline',
  overheated: 'thermometer-outline',
  too_cold: 'snow-outline',
  low_humidity: 'cloud-outline',
  high_humidity: 'rainy-outline',
  add_ph_up: 'flask-outline',
  add_ph_down: 'flask-outline',
};

export default function RoomAlertsBanner({ summaries, onDismiss }: Props) {
  const r = useResponsive();

  if (summaries.length === 0) {
    return null;
  }

  return (
    <GlassCard
      style={[
        styles.card,
        {
          marginBottom: r.scale(16),
          borderColor: 'rgba(230,126,34,0.32)',
        },
      ]}
    >
      <View style={[styles.header, { paddingHorizontal: r.scale(14), paddingTop: r.scale(12) }]}>
        <Text style={[styles.headerLabel, { fontSize: r.scale(11) }]}>Suggestions</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onDismiss}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Dismiss suggestions"
        >
          <Text style={[styles.dismissText, { fontSize: r.scale(12) }]}>Dismiss</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.rooms, { padding: r.scale(12), gap: r.scale(8) }]}>
        {summaries.map((summary) => (
          <View
            key={summary.roomId}
            style={[
              styles.roomBlock,
              {
                borderRadius: r.scale(12),
                paddingVertical: r.scale(10),
                paddingHorizontal: r.scale(12),
                gap: r.scale(8),
              },
            ]}
          >
            <Text style={[styles.roomName, { fontSize: r.scale(14) }]}>{summary.roomName}</Text>

            <View style={{ gap: r.scale(6) }}>
              {summary.recommendations.map((recommendation) => (
                <View
                  key={`${summary.roomId}-${recommendation.issue}`}
                  style={[styles.recommendationRow, { gap: r.scale(10) }]}
                >
                  <View
                    style={[
                      styles.iconWrap,
                      {
                        width: r.scale(28),
                        height: r.scale(28),
                        borderRadius: r.scale(14),
                      },
                    ]}
                  >
                    <Ionicons
                      name={RECOMMENDATION_ICONS[recommendation.issue]}
                      size={r.scale(14)}
                      color="#FDBA74"
                    />
                  </View>
                  <Text
                    style={[
                      styles.recommendationText,
                      { fontSize: r.scale(13), lineHeight: r.scale(18) },
                    ]}
                  >
                    {recommendation.text}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  dismissText: {
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '600',
  },
  rooms: {},
  roomBlock: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  roomName: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.15,
  },
  recommendationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(230,126,34,0.14)',
    flexShrink: 0,
  },
  recommendationText: {
    flex: 1,
    color: 'rgba(255,255,255,0.72)',
    fontWeight: '500',
  },
});
