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
import { DEFAULT_ROOM_ID, fetchNearbyMachines, type NearbyMachine } from '../data/mockMachines';
import { fetchPlantProfiles } from '../services/plantProfiles';
import { formatDeviceId } from '../types/machine';
import type { PlantProfile } from '../types/plantProfile';
import type { Room } from '../types/room';
import { useResponsive } from '../utils/responsive';

type Step = 'pair' | 'setup';

type Props = {
  visible: boolean;
  rooms: Room[];
  onClose: () => void;
  onSave: (name: string, roomId: string, device: NearbyMachine, plantProfileId: string) => void;
};

function getDefaultRoom(rooms: Room[]): Room | undefined {
  return rooms.find((room) => room.id === DEFAULT_ROOM_ID) ?? rooms[0];
}

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

function mockSignalStrength(deviceId: string): number {
  let hash = 0;
  for (let i = 0; i < deviceId.length; i += 1) {
    hash = deviceId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return (Math.abs(hash) % 3) + 2;
}

function signalLabel(strength: number): string {
  if (strength >= 4) {
    return 'Strong';
  }
  if (strength >= 3) {
    return 'Good';
  }
  return 'Fair';
}

type DeviceRowProps = {
  device: NearbyMachine;
  onPress: () => void;
  scale: (value: number) => number;
};

function DeviceRow({ device, onPress, scale }: DeviceRowProps) {
  const strength = mockSignalStrength(device.id);

  return (
    <TouchableOpacity
      style={[
        styles.deviceRow,
        {
          paddingVertical: scale(14),
          paddingHorizontal: scale(14),
          borderRadius: scale(14),
          marginBottom: scale(10),
          gap: scale(12),
        },
      ]}
      activeOpacity={0.75}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Pair ${device.model} ${formatDeviceId(device.id)}`}
    >
      <View
        style={[
          styles.deviceIcon,
          { width: scale(44), height: scale(44), borderRadius: scale(22) },
        ]}
      >
        <Ionicons name="hardware-chip-outline" size={scale(20)} color="#93C5FD" />
      </View>

      <View style={styles.deviceContent}>
        <Text style={[styles.deviceModel, { fontSize: scale(15) }]} numberOfLines={1}>
          {device.model}
        </Text>
        <Text style={[styles.deviceId, { fontSize: scale(12), marginTop: scale(2) }]}>
          {formatDeviceId(device.id)}
        </Text>
        <View style={[styles.signalRow, { marginTop: scale(6), gap: scale(4) }]}>
          {[1, 2, 3, 4].map((bar) => (
            <View
              key={bar}
              style={[
                styles.signalBar,
                {
                  width: scale(3),
                  height: scale(4 + bar * 2),
                  borderRadius: scale(1),
                  opacity: bar <= strength ? 1 : 0.22,
                },
              ]}
            />
          ))}
          <Text style={[styles.signalText, { fontSize: scale(11), marginLeft: scale(4) }]}>
            {signalLabel(strength)}
          </Text>
        </View>
      </View>

      <View style={[styles.pairButton, { paddingVertical: scale(8), paddingHorizontal: scale(12), borderRadius: scale(10), gap: scale(4) }]}>
        <Text style={[styles.pairButtonText, { fontSize: scale(13) }]}>Pair</Text>
        <Ionicons name="arrow-forward" size={scale(14)} color="#BFDBFE" />
      </View>
    </TouchableOpacity>
  );
}

export default function AddMachineModal({ visible, rooms, onClose, onSave }: Props) {
  const r = useResponsive();
  const [step, setStep] = useState<Step>('pair');
  const [nearbyDevices, setNearbyDevices] = useState<NearbyMachine[]>([]);
  const [scanning, setScanning] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<NearbyMachine | null>(null);
  const [draftName, setDraftName] = useState('');
  const [roomId, setRoomId] = useState(getDefaultRoom(rooms)?.id ?? '');
  const [roomOpen, setRoomOpen] = useState(false);
  const [plantProfiles, setPlantProfiles] = useState<PlantProfile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [profilesError, setProfilesError] = useState<string | null>(null);
  const [plantProfileId, setPlantProfileId] = useState('');
  const [plantProfileOpen, setPlantProfileOpen] = useState(false);

  const pairedDeviceIds = useMemo(() => getPairedDeviceIds(rooms), [rooms]);

  const availableDevices = useMemo(
    () => nearbyDevices.filter((device) => !pairedDeviceIds.has(device.id)),
    [nearbyDevices, pairedDeviceIds],
  );

  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === roomId) ?? getDefaultRoom(rooms),
    [roomId, rooms],
  );

  const selectedPlantProfile = useMemo(
    () => plantProfiles.find((profile) => profile.id === plantProfileId) ?? plantProfiles[0],
    [plantProfileId, plantProfiles],
  );

  const loadPlantProfiles = useCallback(async () => {
    setLoadingProfiles(true);
    setProfilesError(null);
    try {
      const profiles = await fetchPlantProfiles();
      setPlantProfiles(profiles);
      setPlantProfileId((current) =>
        profiles.some((profile) => profile.id === current) ? current : (profiles[0]?.id ?? ''),
      );
      if (profiles.length === 0) {
        setProfilesError('No plant profiles in Firestore.');
      }
    } catch (error) {
      setPlantProfiles([]);
      setPlantProfileId('');
      setProfilesError(
        error instanceof Error ? error.message : 'Could not load plant profiles.',
      );
    } finally {
      setLoadingProfiles(false);
    }
  }, []);

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
      setPlantProfileOpen(false);
      const initialRoom = getDefaultRoom(rooms);
      setRoomId(initialRoom?.id ?? '');
      setDraftName(suggestMachineName(initialRoom));
      void loadNearbyDevices();
      void loadPlantProfiles();
    }
  }, [visible, rooms, loadNearbyDevices, loadPlantProfiles]);

  const handleDeviceSelect = (device: NearbyMachine) => {
    setSelectedDevice(device);
    setDraftName(`${device.model} - ${formatDeviceId(device.id)}`);
    setRoomId(getDefaultRoom(rooms)?.id ?? '');
    setRoomOpen(false);
    setPlantProfileOpen(false);
    setStep('setup');
    if (plantProfiles.length === 0 && !loadingProfiles) {
      void loadPlantProfiles();
    }
  };

  const handleRoomSelect = (nextRoomId: string) => {
    setRoomId(nextRoomId);
    setRoomOpen(false);
    setPlantProfileOpen(false);
  };

  const handlePlantProfileSelect = (nextProfileId: string) => {
    setPlantProfileId(nextProfileId);
    setPlantProfileOpen(false);
    setRoomOpen(false);
  };

  const handleSave = () => {
    const trimmed = draftName.trim();
    if (!trimmed || !roomId || !selectedDevice || !plantProfileId) {
      return;
    }
    onSave(trimmed, roomId, selectedDevice, plantProfileId);
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

              <View
                style={[
                  styles.scanHero,
                  {
                    marginTop: r.scale(16),
                    paddingVertical: r.scale(16),
                    paddingHorizontal: r.scale(14),
                    borderRadius: r.scale(14),
                  },
                ]}
              >
                <View
                  style={[
                    styles.scanIconWrap,
                    {
                      width: r.scale(52),
                      height: r.scale(52),
                      borderRadius: r.scale(26),
                    },
                    scanning && styles.scanIconWrapActive,
                  ]}
                >
                  {scanning ? (
                    <ActivityIndicator size="small" color="#93C5FD" />
                  ) : (
                    <Ionicons name="bluetooth" size={r.scale(24)} color="#93C5FD" />
                  )}
                </View>
                <Text style={[styles.scanTitle, { fontSize: r.scale(15), marginTop: r.scale(12) }]}>
                  {scanning ? 'Scanning nearby...' : 'Ready to pair'}
                </Text>
                <Text
                  style={[
                    styles.scanSubtitle,
                    { fontSize: r.scale(12), marginTop: r.scale(6), lineHeight: r.scale(17) },
                  ]}
                >
                  Power on your AEREA device and keep it close to this phone.
                </Text>
              </View>

              <View
                style={[
                  styles.listHeader,
                  { marginTop: r.scale(18), marginBottom: r.scale(10) },
                ]}
              >
                <View style={styles.listHeaderLeft}>
                  <Text style={[styles.fieldLabel, { fontSize: r.scale(12) }]}>Nearby</Text>
                  {!scanning ? (
                    <View
                      style={[
                        styles.countBadge,
                        {
                          marginLeft: r.scale(8),
                          paddingHorizontal: r.scale(8),
                          paddingVertical: r.scale(3),
                          borderRadius: r.scale(8),
                        },
                      ]}
                    >
                      <Text style={[styles.countBadgeText, { fontSize: r.scale(11) }]}>
                        {availableDevices.length}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <TouchableOpacity
                  style={[
                    styles.refreshButton,
                    {
                      paddingVertical: r.scale(7),
                      paddingHorizontal: r.scale(12),
                      borderRadius: r.scale(10),
                      gap: r.scale(6),
                    },
                    scanning && styles.refreshButtonDisabled,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => void loadNearbyDevices()}
                  disabled={scanning}
                  accessibilityRole="button"
                  accessibilityLabel="Refresh nearby machines"
                >
                  <Ionicons
                    name="refresh"
                    size={r.scale(15)}
                    color={scanning ? 'rgba(147,197,253,0.45)' : '#93C5FD'}
                  />
                  <Text
                    style={[
                      styles.refreshText,
                      { fontSize: r.scale(13) },
                      scanning && styles.refreshTextDisabled,
                    ]}
                  >
                    Refresh
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                style={[styles.deviceList, { maxHeight: r.scale(260) }]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {scanning && availableDevices.length === 0 ? (
                  <View
                    style={[
                      styles.emptyState,
                      {
                        paddingVertical: r.scale(32),
                        borderRadius: r.scale(14),
                      },
                    ]}
                  >
                    <View style={[styles.scanPulse, { width: r.scale(56), height: r.scale(56), borderRadius: r.scale(28) }]}>
                      <View style={[styles.scanPulseInner, { width: r.scale(40), height: r.scale(40), borderRadius: r.scale(20) }]}>
                        <Ionicons name="radio-outline" size={r.scale(20)} color="#93C5FD" />
                      </View>
                    </View>
                    <Text style={[styles.emptyText, { fontSize: r.scale(14), marginTop: r.scale(14) }]}>
                      Looking for AEREA devices...
                    </Text>
                    <Text style={[styles.emptyHint, { fontSize: r.scale(12), marginTop: r.scale(6) }]}>
                      This usually takes a few seconds.
                    </Text>
                  </View>
                ) : availableDevices.length === 0 ? (
                  <View
                    style={[
                      styles.emptyState,
                      styles.emptyStateCard,
                      {
                        paddingVertical: r.scale(28),
                        paddingHorizontal: r.scale(16),
                        borderRadius: r.scale(14),
                      },
                    ]}
                  >
                    <Ionicons name="search-outline" size={r.scale(30)} color="rgba(255,255,255,0.35)" />
                    <Text style={[styles.emptyText, { fontSize: r.scale(14), marginTop: r.scale(12) }]}>
                      No nearby machines found
                    </Text>
                    <Text style={[styles.emptyHint, { fontSize: r.scale(12), marginTop: r.scale(6), lineHeight: r.scale(17) }]}>
                      Check that the device is on and in pairing mode, then tap refresh.
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.emptyRefreshButton,
                        {
                          marginTop: r.scale(14),
                          paddingVertical: r.scale(10),
                          paddingHorizontal: r.scale(16),
                          borderRadius: r.scale(10),
                          gap: r.scale(6),
                        },
                      ]}
                      activeOpacity={0.7}
                      onPress={() => void loadNearbyDevices()}
                      accessibilityRole="button"
                      accessibilityLabel="Scan again for nearby machines"
                    >
                      <Ionicons name="refresh" size={r.scale(16)} color="#93C5FD" />
                      <Text style={[styles.refreshText, { fontSize: r.scale(13) }]}>Scan again</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  availableDevices.map((device) => (
                    <DeviceRow
                      key={device.id}
                      device={device}
                      scale={r.scale}
                      onPress={() => handleDeviceSelect(device)}
                    />
                  ))
                )}
              </ScrollView>

              <View
                style={[
                  styles.helpTip,
                  {
                    marginTop: r.scale(14),
                    paddingVertical: r.scale(10),
                    paddingHorizontal: r.scale(12),
                    borderRadius: r.scale(12),
                    gap: r.scale(8),
                  },
                ]}
              >
                <Ionicons name="information-circle-outline" size={r.scale(16)} color="rgba(255,255,255,0.45)" />
                <Text style={[styles.helpTipText, { fontSize: r.scale(12), lineHeight: r.scale(17), flex: 1 }]}>
                  Select a device to continue with naming and room assignment.
                </Text>
              </View>
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
                      paddingVertical: r.scale(12),
                      paddingHorizontal: r.scale(14),
                      borderRadius: r.scale(12),
                      gap: r.scale(12),
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.pairedDeviceIcon,
                      { width: r.scale(36), height: r.scale(36), borderRadius: r.scale(18) },
                    ]}
                  >
                    <Ionicons name="checkmark" size={r.scale(18)} color="#34D399" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pairedDeviceTitle, { fontSize: r.scale(12) }]}>
                      Selected device
                    </Text>
                    <Text style={[styles.pairedDeviceModel, { fontSize: r.scale(14), marginTop: r.scale(2) }]}>
                      {selectedDevice.model}
                    </Text>
                    <Text style={[styles.pairedDeviceId, { fontSize: r.scale(12), marginTop: r.scale(2) }]}>
                      {formatDeviceId(selectedDevice.id)}
                    </Text>
                  </View>
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
                  onPress={() => {
                    setRoomOpen((open) => !open);
                    setPlantProfileOpen(false);
                  }}
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

              <Text style={[styles.fieldLabel, { fontSize: r.scale(12), marginTop: r.scale(18) }]}>
                Plant profile
              </Text>
              <View
                style={[
                  styles.roomPickerWrap,
                  { marginTop: r.scale(8), zIndex: plantProfileOpen ? 2 : 0 },
                ]}
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
                    plantProfileOpen && styles.roomPickerOpen,
                    loadingProfiles && styles.pickerDisabled,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (loadingProfiles) {
                      return;
                    }
                    if (profilesError || plantProfiles.length === 0) {
                      void loadPlantProfiles();
                      return;
                    }
                    setPlantProfileOpen((open) => !open);
                    setRoomOpen(false);
                  }}
                  disabled={loadingProfiles}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: plantProfileOpen }}
                  accessibilityLabel={`Plant profile ${selectedPlantProfile?.name ?? 'none'}, change plant profile`}
                >
                  {loadingProfiles ? (
                    <ActivityIndicator size="small" color="#93C5FD" style={{ flex: 1 }} />
                  ) : (
                    <Text style={[styles.roomPickerText, { fontSize: r.scale(16) }]}>
                      {profilesError
                        ? 'Tap to retry'
                        : selectedPlantProfile?.name ?? 'No profiles found'}
                    </Text>
                  )}
                  <Ionicons
                    name={plantProfileOpen ? 'chevron-up' : 'chevron-down'}
                    size={r.scale(18)}
                    color="rgba(255,255,255,0.65)"
                  />
                </TouchableOpacity>

                {plantProfileOpen ? (
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
                    {plantProfiles.map((profile) => {
                      const selected = profile.id === plantProfileId;
                      return (
                        <TouchableOpacity
                          key={profile.id}
                          style={[
                            styles.roomOption,
                            {
                              paddingVertical: r.scale(10),
                              paddingHorizontal: r.scale(12),
                            },
                            selected && styles.roomOptionSelected,
                          ]}
                          activeOpacity={0.7}
                          onPress={() => handlePlantProfileSelect(profile.id)}
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
                            {profile.name}
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
              {profilesError ? (
                <Text
                  style={[
                    styles.profileErrorText,
                    { fontSize: r.scale(11), marginTop: r.scale(6), lineHeight: r.scale(15) },
                  ]}
                >
                  {profilesError}
                </Text>
              ) : null}

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
                  disabled={!draftName.trim() || !roomId || !plantProfileId}
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
  scanHero: {
    alignItems: 'center',
    backgroundColor: 'rgba(96,165,250,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(96,165,250,0.2)',
  },
  scanIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(96,165,250,0.14)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(96,165,250,0.28)',
  },
  scanIconWrapActive: {
    backgroundColor: 'rgba(96,165,250,0.2)',
    borderColor: 'rgba(147,197,253,0.45)',
  },
  scanTitle: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
  scanSubtitle: {
    color: 'rgba(255,255,255,0.52)',
    fontWeight: '500',
    textAlign: 'center',
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
  listHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countBadge: {
    backgroundColor: 'rgba(96,165,250,0.18)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(96,165,250,0.35)',
  },
  countBadgeText: {
    color: '#93C5FD',
    fontWeight: '700',
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
  refreshButtonDisabled: {
    opacity: 0.65,
  },
  refreshText: {
    color: '#93C5FD',
    fontWeight: '600',
  },
  refreshTextDisabled: {
    color: 'rgba(147,197,253,0.55)',
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
  deviceContent: {
    flex: 1,
    minWidth: 0,
  },
  deviceModel: {
    color: '#fff',
    fontWeight: '700',
  },
  deviceId: {
    color: 'rgba(255,255,255,0.48)',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  signalBar: {
    backgroundColor: '#34D399',
  },
  signalText: {
    color: 'rgba(255,255,255,0.42)',
    fontWeight: '500',
  },
  pairButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(96,165,250,0.18)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(96,165,250,0.35)',
  },
  pairButtonText: {
    color: '#BFDBFE',
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  scanPulse: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(96,165,250,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(96,165,250,0.18)',
  },
  scanPulseInner: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(96,165,250,0.16)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(96,165,250,0.28)',
  },
  emptyRefreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(96,165,250,0.35)',
    backgroundColor: 'rgba(96,165,250,0.12)',
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
  helpTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  helpTipText: {
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '500',
  },
  pairedDeviceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52,211,153,0.1)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(52,211,153,0.28)',
  },
  pairedDeviceIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(52,211,153,0.16)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(52,211,153,0.32)',
  },
  pairedDeviceTitle: {
    color: 'rgba(110,231,183,0.75)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  pairedDeviceModel: {
    color: '#fff',
    fontWeight: '700',
  },
  pairedDeviceId: {
    color: 'rgba(255,255,255,0.55)',
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
  pickerDisabled: {
    opacity: 0.65,
  },
  profileErrorText: {
    color: 'rgba(248,113,113,0.85)',
    fontWeight: '500',
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
