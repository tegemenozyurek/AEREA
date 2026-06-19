import React, { useCallback, useEffect, useRef } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import type { MetricKey } from '../utils/mockMetricHistory';
import { useResponsive } from '../utils/responsive';
import MetricHistoryChart from './MetricHistoryChart';

export type MetricHistoryItem = {
  key: MetricKey;
  label: string;
  color: string;
  value: number;
};

type Props = {
  metrics: MetricHistoryItem[];
  selectedIndex: number;
  onSelectedIndexChange: (index: number) => void;
  machineId: string;
};

export default function MetricHistorySection({
  metrics,
  selectedIndex,
  onSelectedIndexChange,
  machineId,
}: Props) {
  const r = useResponsive();
  const { width: screenWidth } = useWindowDimensions();
  const listRef = useRef<FlatList<MetricHistoryItem>>(null);
  const pageWidth = Math.min(r.contentMaxWidth, screenWidth - r.horizontalPadding * 2);
  const chartWidth = pageWidth - r.scale(32);

  useEffect(() => {
    if (selectedIndex < 0 || selectedIndex >= metrics.length) {
      return;
    }
    listRef.current?.scrollToIndex({ index: selectedIndex, animated: true });
  }, [metrics.length, selectedIndex]);

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const nextIndex = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
      const clamped = Math.max(0, Math.min(metrics.length - 1, nextIndex));
      if (clamped !== selectedIndex) {
        onSelectedIndexChange(clamped);
      }
    },
    [metrics.length, onSelectedIndexChange, pageWidth, selectedIndex],
  );

  const activeMetric = metrics[selectedIndex] ?? metrics[0];

  return (
    <View
      style={[
        styles.section,
        {
          borderRadius: r.scale(16),
          marginTop: r.scale(16),
          paddingTop: r.scale(16),
          paddingBottom: r.scale(14),
        },
      ]}
    >
      <View style={[styles.header, { paddingHorizontal: r.scale(16) }]}>
        <Text style={[styles.title, { fontSize: r.scale(16), color: activeMetric.color }]}>
          {activeMetric.label}
        </Text>
        <Text style={[styles.subtitle, { fontSize: r.scale(12) }]}>Last 48 hours · 6h intervals</Text>
      </View>

      <FlatList
        ref={listRef}
        data={metrics}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={pageWidth}
        snapToAlignment="start"
        disableIntervalMomentum
        onMomentumScrollEnd={handleMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: pageWidth,
          offset: pageWidth * index,
          index,
        })}
        onScrollToIndexFailed={(info) => {
          listRef.current?.scrollToOffset({
            offset: info.averageItemLength * info.index,
            animated: true,
          });
        }}
        renderItem={({ item }) => (
          <View style={{ width: pageWidth, paddingHorizontal: r.scale(16) }}>
            <MetricHistoryChart
              metricKey={item.key}
              color={item.color}
              currentValue={item.value}
              machineId={machineId}
              chartWidth={chartWidth}
            />
          </View>
        )}
      />

      <View style={[styles.dotsRow, { marginTop: r.scale(10), gap: r.scale(6) }]}>
        {metrics.map((metric, index) => (
          <View
            key={metric.key}
            style={[
              styles.dot,
              {
                width: index === selectedIndex ? r.scale(16) : r.scale(6),
                backgroundColor:
                  index === selectedIndex ? metric.color : 'rgba(255,255,255,0.2)',
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontWeight: '700',
    letterSpacing: 0.2,
    textTransform: 'capitalize',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '500',
    marginTop: 4,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});
