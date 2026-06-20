import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MetricHistorySection, { type MetricHistoryItem } from '../components/MetricHistorySection';
import MetricRing from '../components/MetricRing';
import type { Machine } from '../types/machine';
import { formatDeviceId } from '../types/machine';
import type { Room } from '../types/room';
import { formatUpdatedAt } from '../utils/formatDate';
import { useResponsive } from '../utils/responsive';

type Props = {
  machine: Machine;
  roomId: string;
  roomName: string;
  rooms: Room[];
  onRoomChange: (roomId: string) => void;
  onNameChange: (name: string) => void;
  onAddRoom?: () => void;
  onBack: () => void;
  onRefresh?: () => Promise<void>;
};

export default function MachineDetailScreen({
  machine,
  roomId,
  roomName,
  rooms,
  onRoomChange,
  onNameChange,
  onAddRoom,
  onBack,
  onRefresh,
}: Props) {
  const r = useResponsive();
  const [refreshing, setRefreshing] = useState(false);
  const [roomOpen, setRoomOpen] = useState(false);
  const [selectedMetricIndex, setSelectedMetricIndex] = useState(1);
  const [renameOpen, setRenameOpen] = useState(false);
  const [draftName, setDraftName] = useState(machine.name);

  const metrics = useMemo<MetricHistoryItem[]>(
    () => [
      { key: 'ppm', label: 'ppm', color: '#FBBF24', value: machine.ppm },
      { key: 'ph', label: 'pH', color: '#34D399', value: machine.ph },
      { key: 'waterLevel', label: 'water', color: '#60A5FA', value: machine.waterLevel },
      { key: 'phDown', label: 'pH down', color: '#FB7185', value: machine.phDown },
      { key: 'phUp', label: 'pH up', color: '#A78BFA', value: machine.phUp },
      { key: 'tankLevel', label: 'tank %', color: '#38BDF8', value: machine.tankLevel },
    ],
    [machine.ph, machine.phDown, machine.phUp, machine.ppm, machine.tankLevel, machine.waterLevel],
  );

  const selectMetric = (index: number) => {
    setSelectedMetricIndex(index);
  };

  const handleAddRoomPress = () => {
    setRoomOpen(false);
    onAddRoom?.();
  };

  const handleRoomSelect = (nextRoomId: string) => {
    setRoomOpen(false);
    if (nextRoomId !== roomId) {
      onRoomChange(nextRoomId);
    }
  };

  const openRename = () => {
    setDraftName(machine.name);
    setRenameOpen(true);
  };

  const closeRename = () => {
    setRenameOpen(false);
    setDraftName(machine.name);
  };

  const saveRename = () => {
    const trimmed = draftName.trim();
    if (!trimmed || trimmed === machine.name) {
      closeRename();
      return;
    }
    onNameChange(trimmed);
    setRenameOpen(false);
  };

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  const statusColor = machine.online ? '#34D399' : '#F87171';
  const statusBg = machine.online ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)';
  const statusBorder = machine.online ? 'rgba(52,211,153,0.28)' : 'rgba(248,113,113,0.28)';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Modal visible={renameOpen} transparent animationType="fade" onRequestClose={closeRename}>
        <Pressable style={styles.renameBackdrop} onPress={closeRename}>
          <Pressable
            style={[
              styles.renameSheet,
              {
                borderRadius: r.scale(18),
                padding: r.scale(18),
                maxWidth: r.contentMaxWidth,
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.renameHeader}>
              <Text style={[styles.renameTitle, { fontSize: r.scale(18) }]}>Rename machine</Text>
              <Pressable
                style={[
                  styles.headerIconButton,
                  { width: r.scale(32), height: r.scale(32), borderRadius: r.scale(16) },
                ]}
                onPress={closeRename}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Close rename dialog"
              >
                <Ionicons name="close" size={r.scale(18)} color="#fff" />
              </Pressable>
            </View>

            <TextInput
              style={[
                styles.renameInput,
                {
                  marginTop: r.scale(14),
                  paddingVertical: r.scale(12),
                  paddingHorizontal: r.scale(14),
                  borderRadius: r.scale(12),
                  fontSize: r.scale(16),
                },
              ]}
              value={draftName}
              onChangeText={setDraftName}
              placeholder="Machine name"
              placeholderTextColor="rgba(255,255,255,0.45)"
              autoFocus
              selectTextOnFocus
              maxLength={48}
              returnKeyType="done"
              onSubmitEditing={saveRename}
            />

            <View style={[styles.renameActions, { marginTop: r.scale(16), gap: r.scale(10) }]}>
              <TouchableOpacity
                style={[styles.renameButton, styles.renameButtonSecondary, { borderRadius: r.scale(12) }]}
                activeOpacity={0.7}
                onPress={closeRename}
              >
                <Text style={[styles.renameButtonText, { fontSize: r.scale(15) }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.renameButton, styles.renameButtonPrimary, { borderRadius: r.scale(12) }]}
                activeOpacity={0.7}
                onPress={saveRename}
                disabled={!draftName.trim()}
              >
                <Text style={[styles.renameButtonText, styles.renameButtonTextPrimary, { fontSize: r.scale(15) }]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
            onPress={openRename}
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void refresh()}
            tintColor="#fff"
            colors={['#008D41']}
          />
        }
      >
        <View
          style={[
            styles.statusCard,
            {
              borderRadius: r.scale(16),
              padding: r.scale(16),
              borderColor: statusBorder,
            },
          ]}
        >
          <View style={[styles.identityRow, { gap: r.scale(12) }]}>
            <View
              style={[
                styles.deviceIconWrap,
                {
                  width: r.scale(48),
                  height: r.scale(48),
                  borderRadius: r.scale(24),
                },
              ]}
            >
              <Ionicons name="hardware-chip-outline" size={r.scale(22)} color="#93C5FD" />
            </View>

            <View style={styles.identityContent}>
              <Text style={[styles.deviceModel, { fontSize: r.scale(17) }]} numberOfLines={1}>
                {machine.model}
              </Text>
              <Text style={[styles.deviceId, { fontSize: r.scale(13), marginTop: r.scale(3) }]}>
                {formatDeviceId(machine.deviceId)}
              </Text>
            </View>

            <View
              style={[
                styles.statusPill,
                {
                  paddingVertical: r.scale(6),
                  paddingHorizontal: r.scale(10),
                  borderRadius: r.scale(20),
                  gap: r.scale(6),
                  backgroundColor: statusBg,
                  borderColor: statusBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  {
                    width: r.scale(7),
                    height: r.scale(7),
                    borderRadius: r.scale(4),
                    backgroundColor: statusColor,
                  },
                ]}
              />
              <Text style={[styles.statusPillText, { fontSize: r.scale(12), color: statusColor }]}>
                {machine.online ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>

          <View style={[styles.cardDivider, { marginVertical: r.scale(14) }]} />

          <View style={{ zIndex: roomOpen ? 2 : 0 }}>
            <Text style={[styles.sectionLabel, { fontSize: r.scale(11), marginBottom: r.scale(8) }]}>
              Room
            </Text>
            <View style={styles.roomPickerWrap}>
              <TouchableOpacity
                style={[
                  styles.roomPicker,
                  {
                    paddingVertical: r.scale(12),
                    paddingHorizontal: r.scale(14),
                    borderRadius: r.scale(12),
                    gap: r.scale(8),
                  },
                  roomOpen && styles.roomPickerOpen,
                ]}
                activeOpacity={0.7}
                onPress={() => setRoomOpen((open) => !open)}
                accessibilityRole="button"
                accessibilityState={{ expanded: roomOpen }}
                accessibilityLabel={`Room ${roomName}, change room`}
              >
                <View style={[styles.roomPickerLeading, { gap: r.scale(8) }]}>
                  <Ionicons name="layers-outline" size={r.scale(16)} color="rgba(255,255,255,0.55)" />
                  <Text style={[styles.roomPickerText, { fontSize: r.scale(15) }]} numberOfLines={1}>
                    {roomName}
                  </Text>
                </View>
                <Ionicons
                  name={roomOpen ? 'chevron-up' : 'chevron-down'}
                  size={r.scale(16)}
                  color="rgba(255,255,255,0.55)"
                />
              </TouchableOpacity>

              {roomOpen && (
                <View
                  style={[
                    styles.roomDropdown,
                    {
                      borderRadius: r.scale(12),
                      marginTop: r.scale(8),
                      paddingVertical: r.scale(4),
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
                  {onAddRoom ? (
                    <>
                      <View style={styles.roomOptionDivider} />
                      <TouchableOpacity
                        style={[
                          styles.roomOption,
                          styles.roomOptionAdd,
                          {
                            paddingVertical: r.scale(10),
                            paddingHorizontal: r.scale(12),
                            gap: r.scale(8),
                          },
                        ]}
                        activeOpacity={0.7}
                        onPress={handleAddRoomPress}
                        accessibilityRole="button"
                        accessibilityLabel="Add room"
                      >
                        <Ionicons name="add" size={r.scale(16)} color="#60A5FA" />
                        <Text style={[styles.roomOptionAddText, { fontSize: r.scale(14) }]}>
                          Add room
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : null}
                </View>
              )}
            </View>
          </View>

          <View style={[styles.cardDivider, { marginVertical: r.scale(14) }]} />

          <View style={[styles.metaRow, { gap: r.scale(8) }]}>
            <Ionicons name="time-outline" size={r.scale(15)} color="rgba(255,255,255,0.4)" />
            <Text style={[styles.metaLabel, { fontSize: r.scale(12) }]}>
              {machine.online ? 'Updated' : 'Last seen'}
            </Text>
            <Text style={[styles.metaValue, { fontSize: r.scale(12), flex: 1, textAlign: 'right' }]}>
              {formatUpdatedAt(machine.updatedAt)}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.metricsCard,
            {
              borderRadius: r.scale(16),
              paddingVertical: r.scale(16),
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
              size={r.scale(64)}
              labelSize={r.scale(11)}
              valueSize={r.scale(14)}
              labelGap={r.scale(5)}
              shiftX={-r.scale(12)}
              onPress={() => selectMetric(0)}
            />
            <MetricRing
              floatIndex={1}
              label="pH"
              value={machine.ph}
              color="#34D399"
              size={r.scale(76)}
              labelSize={r.scale(11)}
              valueSize={r.scale(17)}
              labelGap={r.scale(5)}
              onPress={() => selectMetric(1)}
            />
            <MetricRing
              floatIndex={2}
              label="water"
              value={`${machine.waterLevel}%`}
              color="#60A5FA"
              size={r.scale(64)}
              labelSize={r.scale(11)}
              valueSize={r.scale(13)}
              labelGap={r.scale(5)}
              shiftX={r.scale(12)}
              icon={<Ionicons name="water" size={r.scale(12)} color="#60A5FA" style={{ marginBottom: 2 }} />}
              onPress={() => selectMetric(2)}
            />
          </View>

          <View style={[styles.metricsRow, { marginTop: r.scale(12), gap: r.scale(10), overflow: 'visible' }]}>
            <MetricRing
              floatIndex={3}
              label="pH down"
              value={machine.phDown}
              color="#FB7185"
              size={r.scale(60)}
              labelSize={r.scale(11)}
              valueSize={r.scale(14)}
              labelGap={r.scale(5)}
              shiftX={-r.scale(12)}
              onPress={() => selectMetric(3)}
            />
            <MetricRing
              floatIndex={4}
              label="pH up"
              value={machine.phUp}
              color="#A78BFA"
              size={r.scale(60)}
              labelSize={r.scale(11)}
              valueSize={r.scale(14)}
              labelGap={r.scale(5)}
              onPress={() => selectMetric(4)}
            />
            <MetricRing
              floatIndex={5}
              label="tank %"
              value={`${machine.tankLevel}%`}
              color="#38BDF8"
              size={r.scale(60)}
              labelSize={r.scale(11)}
              valueSize={r.scale(13)}
              labelGap={r.scale(5)}
              shiftX={r.scale(12)}
              onPress={() => selectMetric(5)}
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
    backgroundColor: 'rgba(15,23,42,0.72)',
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'visible',
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(96,165,250,0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(96,165,250,0.25)',
  },
  identityContent: {
    flex: 1,
    minWidth: 0,
  },
  deviceModel: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  deviceId: {
    color: 'rgba(255,255,255,0.48)',
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  statusDot: {
    shadowColor: '#34D399',
    shadowOpacity: 0.8,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  statusPillText: {
    fontWeight: '700',
  },
  cardDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  sectionLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaLabel: {
    color: 'rgba(255,255,255,0.42)',
    fontWeight: '500',
  },
  metaValue: {
    color: 'rgba(255,255,255,0.72)',
    fontWeight: '600',
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
  },
  roomPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  roomPickerLeading: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  roomPickerOpen: {
    borderColor: 'rgba(96,165,250,0.4)',
    backgroundColor: 'rgba(96,165,250,0.08)',
  },
  roomPickerText: {
    color: '#fff',
    fontWeight: '600',
    flex: 1,
  },
  roomDropdown: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(10,15,28,0.98)',
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
  roomOptionDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginVertical: 4,
  },
  roomOptionAdd: {
    justifyContent: 'flex-start',
  },
  roomOptionAddText: {
    color: '#60A5FA',
    fontWeight: '600',
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
  renameBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  renameSheet: {
    width: '100%',
    backgroundColor: 'rgba(15,23,42,0.96)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  renameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  renameTitle: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  renameInput: {
    color: '#fff',
    fontWeight: '600',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  renameActions: {
    flexDirection: 'row',
  },
  renameButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  renameButtonSecondary: {
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  renameButtonPrimary: {
    borderColor: 'rgba(96,165,250,0.5)',
    backgroundColor: 'rgba(96,165,250,0.2)',
  },
  renameButtonText: {
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  renameButtonTextPrimary: {
    color: '#fff',
    fontWeight: '700',
  },
});
