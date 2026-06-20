import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { fetchNearbyMachines, type NearbyMachine } from '../data/mockMachines';
import type { Room } from '../types/room';
import { useResponsive } from '../utils/responsive';

type Step = 'pair' | 'setup';

type Props = {
  visible: boolean;
  rooms: Room[];
  onClose: () => void;
  onSave: (name: string, roomId: string, device: NearbyMachine) => void;
};

function suggestMachineName(room: Room | undefined): string {
  if (!room) {
    return 'Machine #1';
  }
  return `Machine #${room.machines.length + 1}`;
}

function getPairedDeviceIds(rooms: Room[]): Set<string> {
  const ids = new Set<string>();
  rooms.forEach((room) => {
    room.machines.forEach((machine) => {
      if (machine.id.startsWith('aerea-')) {
        ids.add(machine.id.slice('aerea-'.length));
      }
    });
  });
  return ids;
}

export default function AddMachineModal({ visible, rooms, onClose, onSave }: Props) {
  const r = useResponsive();
  const [step, setStep] = useState<Step>('pair');
  const [nearbyDevices, setNearbyDevices] = useState<NearbyMachine[]>([]);
  const [scanning, setScanning] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<NearbyMachine | null>(null);
  const [draftName, setDraftName] = useState('');
  const [roomId, setRoomId] = useState(rooms[0]?.id ?? '');
  const [roomOpen, setRoomOpen] = useState(false);

  const pairedDeviceIds = useMemo(() => getPairedDeviceIds(rooms), [rooms]);

  const availableDevices = useMemo(
    () => nearbyDevices.filter((device) => !pairedDeviceIds.has(device.id)),
    [nearbyDevices, pairedDeviceIds],
  );

  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === roomId) ?? rooms[0],
    [roomId, rooms],
  );

  const loadNearbyDevices = useCallback(async () => {
    setScanning(true);
    try {
      const devices = await fetchNearbyMachines();
      setNearbyDevices(devices);
    } finally {
      setScanning(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      setStep('pair');
      setSelectedDevice(null);
      setRoomOpen(false);
      const initialRoom = rooms[0];
      setRoomId(initialRoom?.id ?? '');
      setDraftName(suggestMachineName(initialRoom));
      void loadNearbyDevices();
    }
  }, [visible, rooms, loadNearbyDevices]);

  const handleDeviceSelect = (device: NearbyMachine) => {
    setSelectedDevice(device);
    setDraftName(device.label);
    setRoomId(rooms[0]?.id ?? '');
    setRoomOpen(false);
    setStep('setup');
  };

  const handleRoomSelect = (nextRoomId: string) => {
    setRoomId(nextRoomId);
    setRoomOpen(false);
  };

  const handleSave = () => {
    const trimmed = draftName.trim();
    if (!trimmed || !roomId || !selectedDevice) {
      return;
    }
    onSave(trimmed, roomId, selectedDevice);
  };

  const handleBackdropPress = () => {
    if (step === 'setup') {
      setStep('pair');
      setSelectedDevice(null);
      return;
    }
    onClose();
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleBackdropPress}>
      <Pressable style={styles.backdrop} onPress={handleBackdropPress}>
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
          {step === 'pair' ? (
            <>
              <View style={styles.header}>
                <Text style={[styles.title, { fontSize: r.scale(18) }]}>Pair Machine</Text>
                <Pressable
                  style={[
                    styles.closeButton,
                    { width: r.scale(32), height: r.scale(32), borderRadius: r.scale(16) },
                  ]}
                  onPress={onClose}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Close pair machine dialog"
                >
                  <Ionicons name="close" size={r.scale(18)} color="#fff" />
                </Pressable>
              </View>

              <Text
                style={[
                  styles.subtitle,
                  { fontSize: r.scale(13), marginTop: r.scale(8), lineHeight: r.scale(18) },
                ]}
              >
                Select a nearby machine to connect.
              </Text>

              <View
                style={[
                  styles.listHeader,
                  { marginTop: r.scale(18), marginBottom: r.scale(10) },
                ]}
              >
                <Text style={[styles.fieldLabel, { fontSize: r.scale(12) }]}>Nearby machines</Text>
                <TouchableOpacity
                  style={[
                    styles.refreshButton,
                    {
                      paddingVertical: r.scale(6),
                      paddingHorizontal: r.scale(10),
                      borderRadius: r.scale(10),
                      gap: r.scale(6),
                    },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => void loadNearbyDevices()}
                  disabled={scanning}
                  accessibilityRole="button"
                  accessibilityLabel="Refresh nearby machines"
                >
                  {scanning ? (
                    <ActivityIndicator size="small" color="#93C5FD" />
                  ) : (
                    <Ionicons name="refresh" size={r.scale(16)} color="#93C5FD" />
                  )}
                  <Text style={[styles.refreshText, { fontSize: r.scale(13) }]}>Refresh</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                style={[styles.deviceList, { maxHeight: r.scale(220) }]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {scanning && availableDevices.length === 0 ? (
                  <View style={[styles.emptyState, { paddingVertical: r.scale(28) }]}>
                    <ActivityIndicator size="small" color="#93C5FD" />
                    <Text style={[styles.emptyText, { fontSize: r.scale(14), marginTop: r.scale(10) }]}>
                      Scanning for nearby machines...
                    </Text>
                  </View>
                ) : availableDevices.length === 0 ? (
                  <View style={[styles.emptyState, { paddingVertical: r.scale(28) }]}>
                    <Ionicons name="bluetooth-outline" size={r.scale(28)} color="rgba(255,255,255,0.35)" />
                    <Text style={[styles.emptyText, { fontSize: r.scale(14), marginTop: r.scale(10) }]}>
                      No nearby machines found.
                    </Text>
                    <Text style={[styles.emptyHint, { fontSize: r.scale(12), marginTop: r.scale(4) }]}>
                      Tap refresh to scan again.
                    </Text>
                  </View>
                ) : (
                  availableDevices.map((device) => (
                    <TouchableOpacity
                      key={device.id}
                      style={[
                        styles.deviceRow,
                        {
                          paddingVertical: r.scale(12),
                          paddingHorizontal: r.scale(14),
                          borderRadius: r.scale(12),
                          marginBottom: r.scale(8),
                          gap: r.scale(12),
                        },
                      ]}
                      activeOpacity={0.7}
                      onPress={() => handleDeviceSelect(device)}
                      accessibilityRole="button"
                      accessibilityLabel={`Pair ${device.label}`}
                    >
                      <View
                        style={[
                          styles.deviceIcon,
                          { width: r.scale(36), height: r.scale(36), borderRadius: r.scale(18) },
                        ]}
                      >
                        <Ionicons name="hardware-chip-outline" size={r.scale(18)} color="#93C5FD" />
                      </View>
                      <Text style={[styles.deviceLabel, { fontSize: r.scale(15), flex: 1 }]}>
                        {device.label}
                      </Text>
                      <Ionicons name="chevron-forward" size={r.scale(18)} color="rgba(255,255,255,0.45)" />
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </>
          ) : (
            <>
              <View style={styles.header}>
                <Pressable
                  style={[
                    styles.backButton,
                    { width: r.scale(32), height: r.scale(32), borderRadius: r.scale(16) },
                  ]}
                  onPress={() => {
                    setStep('pair');
                    setSelectedDevice(null);
                  }}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Back to pair machine"
                >
                  <Ionicons name="chevron-back" size={r.scale(18)} color="#fff" />
                </Pressable>
                <Text style={[styles.title, styles.setupTitle, { fontSize: r.scale(18) }]}>
                  Set up machine
                </Text>
                <Pressable
                  style={[
                    styles.closeButton,
                    { width: r.scale(32), height: r.scale(32), borderRadius: r.scale(16) },
                  ]}
                  onPress={onClose}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Close add machine dialog"
                >
                  <Ionicons name="close" size={r.scale(18)} color="#fff" />
                </Pressable>
              </View>

              {selectedDevice ? (
                <View
                  style={[
                    styles.pairedDeviceBadge,
                    {
                      marginTop: r.scale(14),
                      paddingVertical: r.scale(10),
                      paddingHorizontal: r.scale(12),
                      borderRadius: r.scale(12),
                      gap: r.scale(8),
                    },
                  ]}
                >
                  <Ionicons name="link-outline" size={r.scale(16)} color="#34D399" />
                  <Text style={[styles.pairedDeviceText, { fontSize: r.scale(13) }]}>
                    Paired with {selectedDevice.label}
                  </Text>
                </View>
              ) : null}

              <Text style={[styles.fieldLabel, { fontSize: r.scale(12), marginTop: r.scale(16) }]}>
                Machine name
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    marginTop: r.scale(8),
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
                maxLength={64}
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />

              <Text style={[styles.fieldLabel, { fontSize: r.scale(12), marginTop: r.scale(18) }]}>
                Room
              </Text>
              <View
                style={[styles.roomPickerWrap, { marginTop: r.scale(8), zIndex: roomOpen ? 2 : 0 }]}
              >
                <TouchableOpacity
                  style={[
                    styles.roomPicker,
                    {
                      paddingVertical: r.scale(12),
                      paddingHorizontal: r.scale(14),
                      borderRadius: r.scale(12),
                      gap: r.scale(6),
                    },
                    roomOpen && styles.roomPickerOpen,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setRoomOpen((open) => !open)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: roomOpen }}
                  accessibilityLabel={`Room ${selectedRoom?.name ?? 'none'}, change room`}
                >
                  <Text style={[styles.roomPickerText, { fontSize: r.scale(16) }]}>
                    {selectedRoom?.name ?? 'Select room'}
                  </Text>
                  <Ionicons
                    name={roomOpen ? 'chevron-up' : 'chevron-down'}
                    size={r.scale(18)}
                    color="rgba(255,255,255,0.65)"
                  />
                </TouchableOpacity>

                {roomOpen ? (
                  <View
                    style={[
                      styles.roomDropdown,
                      {
                        borderRadius: r.scale(12),
                        marginTop: r.scale(6),
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
                  </View>
                ) : null}
              </View>

              <View style={[styles.actions, { marginTop: r.scale(18), gap: r.scale(10) }]}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.actionButtonSecondary,
                    { borderRadius: r.scale(12) },
                  ]}
                  activeOpacity={0.7}
                  onPress={onClose}
                >
                  <Text style={[styles.actionText, { fontSize: r.scale(15) }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.actionButtonPrimary,
                    { borderRadius: r.scale(12) },
                  ]}
                  activeOpacity={0.7}
                  onPress={handleSave}
                  disabled={!draftName.trim() || !roomId}
                >
                  <Text style={[styles.actionText, styles.actionTextPrimary, { fontSize: r.scale(15) }]}>
                    Add
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  setupTitle: {
    flex: 1,
    textAlign: 'center',
  },
  title: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '500',
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(96,165,250,0.35)',
    backgroundColor: 'rgba(96,165,250,0.12)',
  },
  refreshText: {
    color: '#93C5FD',
    fontWeight: '600',
  },
  deviceList: {
    flexGrow: 0,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  deviceIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(96,165,250,0.14)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(96,165,250,0.25)',
  },
  deviceLabel: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyHint: {
    color: 'rgba(255,255,255,0.38)',
    fontWeight: '500',
    textAlign: 'center',
  },
  pairedDeviceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52,211,153,0.1)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(52,211,153,0.28)',
  },
  pairedDeviceText: {
    color: '#6EE7B7',
    fontWeight: '600',
  },
  input: {
    color: '#fff',
    fontWeight: '600',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  roomPickerWrap: {
    position: 'relative',
  },
  roomPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  roomPickerOpen: {
    borderColor: 'rgba(96,165,250,0.45)',
  },
  roomPickerText: {
    color: '#fff',
    fontWeight: '600',
    flex: 1,
  },
  roomDropdown: {
    backgroundColor: 'rgba(10,15,28,0.98)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  roomOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roomOptionSelected: {
    backgroundColor: 'rgba(96,165,250,0.12)',
  },
  roomOptionText: {
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  roomOptionTextSelected: {
    color: '#fff',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  actionButtonSecondary: {
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  actionButtonPrimary: {
    borderColor: 'rgba(96,165,250,0.5)',
    backgroundColor: 'rgba(96,165,250,0.2)',
  },
  actionText: {
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  actionTextPrimary: {
    color: '#fff',
    fontWeight: '700',
  },
});
