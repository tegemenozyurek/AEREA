import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import type { MetricKey } from '../utils/mockMetricHistory';
import { useResponsive } from '../utils/responsive';
import MetricHistoryChart from './MetricHistoryChart';

type Props = {
  visible: boolean;
  metricKey: MetricKey;
  label: string;
  color: string;
  currentValue: number;
  machineId: string;
  onClose: () => void;
};

export default function MetricHistoryModal({
  visible,
  metricKey,
  label,
  color,
  currentValue,
  machineId,
  onClose,
}: Props) {
  const r = useResponsive();
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = Math.min(r.contentMaxWidth, screenWidth - r.horizontalPadding * 2) - r.scale(32);

  if (!visible || !label) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            {
              borderRadius: r.scale(18),
              padding: r.scale(18),
              maxWidth: r.contentMaxWidth,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.sheetHeader}>
            <View>
              <Text style={[styles.title, { fontSize: r.scale(18) }]}>{label}</Text>
              <Text style={[styles.subtitle, { fontSize: r.scale(12) }]}>Last 48 hours · 6h intervals</Text>
            </View>
            <Pressable
              style={[styles.closeButton, { width: r.scale(32), height: r.scale(32), borderRadius: r.scale(16) }]}
              onPress={onClose}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Close chart"
            >
              <Ionicons name="close" size={r.scale(18)} color="#fff" />
            </Pressable>
          </View>

          <View style={{ marginTop: r.scale(14) }}>
            <MetricHistoryChart
              metricKey={metricKey}
              color={color}
              currentValue={currentValue}
              machineId={machineId}
              chartWidth={chartWidth}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  sheet: {
    width: '100%',
    backgroundColor: 'rgba(15,23,42,0.96)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.2,
    textTransform: 'capitalize',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '500',
    marginTop: 4,
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
});
