import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Machine } from '../types/machine';

const LABEL_WIDTH = {
  left: 32,
  right: 58,
} as const;

const RIGHT_COLUMN_WIDTH = 48;

type Props = {
  machine: Machine;
};

function Metric({
  label,
  value,
  labelWidth,
}: {
  label: string;
  value: string | number;
  labelWidth: number;
}) {
  return (
    <View style={styles.metricRow}>
      <Text style={[styles.metricLabel, { width: labelWidth }]}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

export default function MachineCard({ machine }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {machine.name}
        </Text>
        <View style={styles.rightColumn}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: machine.online ? '#34D399' : '#F87171' },
            ]}
          />
        </View>
      </View>

      <View style={styles.metrics}>
        <View style={styles.metricsGrid}>
          <View style={styles.metricsCol}>
            <Metric label="ppm" value={machine.ppm} labelWidth={LABEL_WIDTH.left} />
            <Metric label="pH" value={machine.ph} labelWidth={LABEL_WIDTH.left} />
          </View>
          <View style={styles.metricsCol}>
            <Metric label="pH down" value={machine.phDown} labelWidth={LABEL_WIDTH.right} />
            <Metric label="pH up" value={machine.phUp} labelWidth={LABEL_WIDTH.right} />
          </View>
        </View>

        <View style={styles.rightColumn}>
          <View style={styles.waterBlock}>
            <Ionicons name="water" size={22} color="#60A5FA" />
            <Text style={styles.waterValue}>{machine.waterLevel}%</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 9,
  },
  cardTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  rightColumn: {
    width: RIGHT_COLUMN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 24,
    marginRight: -10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  metrics: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingTop: 7,
    gap: 12,
  },
  metricsGrid: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
  },
  metricsCol: {
    flex: 1,
    gap: 10,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '500',
  },
  metricValue: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  waterBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  waterValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
