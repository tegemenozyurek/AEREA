import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MetricHistorySection, { type MetricHistoryItem } from '../components/MetricHistorySection';
import MetricRing from '../components/MetricRing';
import type { Machine } from '../types/machine';
import type { Room } from '../types/room';
import { formatUpdatedAt } from '../utils/formatDate';
import { useResponsive } from '../utils/responsive';

type Props = {
  machine: Machine;
  roomId: string;
  roomName: string;
  rooms: Room[];
  onRoomChange: (roomId: string) => void;
  onBack: () => void;
};

export default function MachineDetailScreen({
  machine,
  roomId,
  roomName,
  rooms,
  onRoomChange,
  onBack,
}: Props) {
  const r = useResponsive();
  const [roomOpen, setRoomOpen] = useState(false);
  const [selectedMetricIndex, setSelectedMetricIndex] = useState(1);

  const metrics = useMemo<MetricHistoryItem[]>(
    () => [
      { key: 'ppm', label: 'ppm', color: '#FBBF24', value: machine.ppm },
      { key: 'ph', label: 'pH', color: '#34D399', value: machine.ph },
      { key: 'waterLevel', label: 'water', color: '#60A5FA', value: machine.waterLevel },
      { key: 'phDown', label: 'pH down', color: '#FB7185', value: machine.phDown },
      { key: 'phUp', label: 'pH up', color: '#A78BFA', value: machine.phUp },
    ],
    [machine.ph, machine.phDown, machine.phUp, machine.ppm, machine.waterLevel],
  );

  const selectMetric = (index: number) => {
    setSelectedMetricIndex(index);
  };

  const handleRoomSelect = (nextRoomId: string) => {
    setRoomOpen(false);
    if (nextRoomId !== roomId) {
      onRoomChange(nextRoomId);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { paddingHorizontal: r.horizontalPadding }]}>
        <View style={[styles.headerActionWrap, { left: r.horizontalPadding }]}>
          <TouchableOpacity
            style={[
              styles.headerIconButton,
              { width: r.scale(36), height: r.scale(36), borderRadius: r.scale(18) },
            ]}
            activeOpacity={0.7}
            onPress={onBack}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={r.scale(24)} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text
          style={[styles.headerTitle, { fontSize: r.scale(18) }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
        >
          {machine.name}
        </Text>
        <View style={[styles.headerActionWrap, { right: r.horizontalPadding }]}>
          <TouchableOpacity
            style={[
              styles.headerIconButton,
              { width: r.scale(36), height: r.scale(36), borderRadius: r.scale(18) },
            ]}
            activeOpacity={0.7}
            onPress={() => {}}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${machine.name}`}
          >
            <Ionicons name="pencil-outline" size={r.scale(18)} color="rgba(255,255,255,0.85)" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: r.horizontalPadding,
            maxWidth: r.contentMaxWidth,
            alignSelf: 'center',
            width: '100%',
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.statusCard,
            {
              borderRightColor: machine.online ? '#34D399' : '#F87171',
              borderRightWidth: r.scale(9),
              borderRadius: r.scale(16),
              padding: r.scale(16),
            },
          ]}
        >
          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { fontSize: r.scale(13) }]}>Status</Text>
            <Text
              style={[
                styles.statusValue,
                { fontSize: r.scale(15), color: machine.online ? '#34D399' : '#F87171' },
              ]}
            >
              {machine.online ? 'Online' : 'Offline'}
            </Text>
          </View>
          <View style={[styles.statusRow, { marginTop: r.scale(10), zIndex: roomOpen ? 2 : 0 }]}>
            <Text style={[styles.statusLabel, { fontSize: r.scale(13) }]}>Room</Text>
            <View style={styles.roomPickerWrap}>
              <TouchableOpacity
                style={[
                  styles.roomPicker,
                  {
                    paddingVertical: r.scale(6),
                    paddingHorizontal: r.scale(10),
                    borderRadius: r.scale(10),
                    gap: r.scale(6),
                  },
                  roomOpen && styles.roomPickerOpen,
                ]}
                activeOpacity={0.7}
                onPress={() => setRoomOpen((open) => !open)}
                accessibilityRole="button"
                accessibilityState={{ expanded: roomOpen }}
                accessibilityLabel={`Room ${roomName}, change room`}
              >
                <Text style={[styles.statusValue, { fontSize: r.scale(15) }]}>{roomName}</Text>
                <Ionicons
                  name={roomOpen ? 'chevron-up' : 'chevron-down'}
                  size={r.scale(16)}
                  color="rgba(255,255,255,0.65)"
                />
              </TouchableOpacity>

              {roomOpen && (
                <View
                  style={[
                    styles.roomDropdown,
                    {
                      borderRadius: r.scale(12),
                      marginTop: r.scale(6),
                      paddingVertical: r.scale(4),
                      minWidth: r.scale(160),
                    },
                  ]}
                >
                  {rooms.map((room) => {
                    const selected = room.id === roomId;
                    return (
                      <TouchableOpacity
                        key={room.id}
                        style={[
                          styles.roomOption,
                          {
                            paddingVertical: r.scale(10),
                            paddingHorizontal: r.scale(12),
                          },
                          selected && styles.roomOptionSelected,
                        ]}
                        activeOpacity={0.7}
                        onPress={() => handleRoomSelect(room.id)}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                      >
                        <Text
                          style={[
                            styles.roomOptionText,
                            { fontSize: r.scale(14) },
                            selected && styles.roomOptionTextSelected,
                          ]}
                        >
                          {room.name}
                        </Text>
                        {selected ? (
                          <Ionicons name="checkmark" size={r.scale(16)} color="#60A5FA" />
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
          <View style={[styles.statusRow, { marginTop: r.scale(10) }]}>
            <Text style={[styles.statusLabel, { fontSize: r.scale(13) }]}>
              {machine.online ? 'Updated' : 'Last Seen'}
            </Text>
            <Text style={[styles.statusValue, { fontSize: r.scale(12) }]}>
              {formatUpdatedAt(machine.updatedAt)}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.metricsCard,
            {
              borderRadius: r.scale(16),
              paddingVertical: r.scale(24),
              paddingHorizontal: r.scale(12),
              marginTop: r.scale(16),
              overflow: 'visible',
            },
          ]}
        >
          <View style={[styles.metricsRow, { gap: r.scale(10), overflow: 'visible' }]}>
            <MetricRing
              floatIndex={0}
              label="ppm"
              value={machine.ppm}
              color="#FBBF24"
              size={r.scale(76)}
              labelSize={r.scale(12)}
              valueSize={r.scale(16)}
              onPress={() => selectMetric(0)}
            />
            <MetricRing
              floatIndex={1}
              label="pH"
              value={machine.ph}
              color="#34D399"
              size={r.scale(92)}
              labelSize={r.scale(12)}
              valueSize={r.scale(20)}
              onPress={() => selectMetric(1)}
            />
            <MetricRing
              floatIndex={2}
              label="water"
              value={`${machine.waterLevel}%`}
              color="#60A5FA"
              size={r.scale(76)}
              labelSize={r.scale(12)}
              valueSize={r.scale(15)}
              icon={<Ionicons name="water" size={r.scale(14)} color="#60A5FA" style={{ marginBottom: 2 }} />}
              onPress={() => selectMetric(2)}
            />
          </View>

          <View style={[styles.metricsRow, { marginTop: r.scale(18), gap: r.scale(24), overflow: 'visible' }]}>
            <MetricRing
              floatIndex={3}
              label="pH down"
              value={machine.phDown}
              color="#FB7185"
              size={r.scale(72)}
              labelSize={r.scale(12)}
              valueSize={r.scale(16)}
              onPress={() => selectMetric(3)}
            />
            <MetricRing
              floatIndex={4}
              label="pH up"
              value={machine.phUp}
              color="#A78BFA"
              size={r.scale(72)}
              labelSize={r.scale(12)}
              valueSize={r.scale(16)}
              onPress={() => selectMetric(4)}
            />
          </View>
        </View>

        <MetricHistorySection
          metrics={metrics}
          selectedIndex={selectedMetricIndex}
          onSelectedIndexChange={setSelectedMetricIndex}
          machineId={machine.id}
        />
      </ScrollView>
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
  headerActionWrap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  headerIconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerTitle: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.3,
    maxWidth: '70%',
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  statusCard: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
  statusValue: {
    color: '#fff',
    fontWeight: '700',
  },
  roomPickerWrap: {
    position: 'relative',
    alignItems: 'flex-end',
    flexShrink: 1,
    maxWidth: '62%',
  },
  roomPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  roomPickerOpen: {
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  roomDropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    zIndex: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(15,23,42,0.95)',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  roomOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roomOptionSelected: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  roomOptionText: {
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  roomOptionTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  metricsCard: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    overflow: 'visible',
  },
});
