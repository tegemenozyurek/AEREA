import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useResponsive } from '../utils/responsive';

type Machine = {
  id: number;
  name: string;
  online: boolean;
  ppm: number;
  ph: number;
  phDown: number;
  phUp: number;
  waterLevel: number;
};

const MACHINES: Machine[] = [
  {
    id: 1,
    name: 'Machine #1 - Tomato 🍅',
    online: true,
    ppm: 1200,
    ph: 6.2,
    phDown: 0,
    phUp: 0,
    waterLevel: 80,
  },
  {
    id: 2,
    name: 'Machine #2 - Strawberry 🍓',
    online: false,
    ppm: 980,
    ph: 5.8,
    phDown: 2,
    phUp: 0,
    waterLevel: 45,
  },
  {
    id: 3,
    name: 'Machine #3 - Pepper 🌶️',
    online: true,
    ppm: 1100,
    ph: 6.5,
    phDown: 0,
    phUp: 1,
    waterLevel: 92,
  },
];

const LABEL_WIDTH = {
  left: 32,
  right: 58,
} as const;

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

function MachineCard({ machine }: { machine: Machine }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {machine.name}
        </Text>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: machine.online ? '#34D399' : '#F87171' },
          ]}
        />
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

        <View style={styles.waterColumn}>
          <Ionicons name="water" size={22} color="#60A5FA" />
          <Text style={styles.waterValue}>{machine.waterLevel}%</Text>
        </View>
      </View>
    </View>
  );
}

export default function MachinesScreen() {
  const r = useResponsive();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { paddingHorizontal: r.horizontalPadding }]}>
        <Text style={styles.headerTitle}>Machines</Text>
        <View style={[styles.headerActionWrap, { right: r.horizontalPadding }]}>
          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.7}
            onPress={() => {}}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Add machine"
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.body, { paddingHorizontal: r.horizontalPadding }]}>
        <Text style={styles.roomTitle}>Room #1</Text>

        <View style={styles.cards}>
          {MACHINES.map((m) => (
            <MachineCard key={m.id} machine={m} />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  headerActionWrap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  addButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  body: {
    flex: 1,
    paddingTop: 8,
  },
  roomTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cards: {
    marginTop: 20,
    gap: 12,
  },
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
    justifyContent: 'space-between',
    gap: 12,
    paddingBottom: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  cardTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
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
  waterColumn: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingLeft: 14,
    marginRight: -2,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: 'rgba(255,255,255,0.1)',
  },
  waterValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
