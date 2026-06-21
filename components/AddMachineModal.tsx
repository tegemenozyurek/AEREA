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

type Step = 'pair' | 'setup' | 'profile';

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

type ModalHeaderProps = {
  title: string;
  subtitle?: string;
  stepLabel?: string;
  onClose: () => void;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  scale: (value: number) => number;
};

function ModalHeader({
  title,
  subtitle,
  stepLabel,
  onClose,
  onBack,
  rightAction,
  scale,
}: ModalHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={[styles.headerSide, { width: scale(32) }]}>
        {onBack ? (
          <Pressable
            style={[styles.iconButton, { width: scale(32), height: scale(32), borderRadius: scale(16) }]}
            onPress={onBack}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={scale(18)} color="#fff" />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.headerCenter}>
        {stepLabel ? (
          <Text style={[styles.stepLabel, { fontSize: scale(11) }]}>{stepLabel}</Text>
        ) : null}
        <Text style={[styles.title, { fontSize: scale(18) }]}>{title}</Text>
        <View style={{ minHeight: scale(34), justifyContent: 'center' }}>
          {subtitle ? (
            <Text style={[styles.subtitle, { fontSize: scale(13), marginTop: scale(4) }]} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={[styles.headerSide, styles.headerSideRight, { width: scale(32) }]}>
        {rightAction ?? (
          <Pressable
            style={[styles.iconButton, { width: scale(32), height: scale(32), borderRadius: scale(16) }]}
            onPress={onClose}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Ionicons name="close" size={scale(18)} color="#fff" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

type DeviceRowProps = {
  device: NearbyMachine;
  onPress: () => void;
  scale: (value: number) => number;
};

function DeviceRow({ device, onPress, scale }: DeviceRowProps) {
  return (
    <TouchableOpacity
      style={[
        styles.deviceRow,
        {
          paddingVertical: scale(12),
          paddingHorizontal: scale(14),
          borderRadius: scale(12),
          marginBottom: scale(8),
        },
      ]}
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Select ${device.model} ${formatDeviceId(device.id)}`}
    >
      <View
        style={[
          styles.deviceIcon,
          { width: scale(36), height: scale(36), borderRadius: scale(18) },
        ]}
      >
        <Ionicons name="hardware-chip-outline" size={scale(18)} color="#93C5FD" />
      </View>
      <View style={styles.deviceContent}>
        <Text style={[styles.deviceModel, { fontSize: scale(15) }]} numberOfLines={1}>
          {device.model}
        </Text>
        <Text style={[styles.deviceId, { fontSize: scale(12), marginTop: scale(2) }]}>
          {formatDeviceId(device.id)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={scale(18)} color="rgba(255,255,255,0.35)" />
    </TouchableOpacity>
  );
}

type DropdownFieldProps = {
  label: string;
  value: string;
  open: boolean;
  onToggle: () => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  children: React.ReactNode;
  scale: (value: number) => number;
};

function DropdownField({
  label,
  value,
  open,
  onToggle,
  loading,
  error,
  onRetry,
  children,
  scale,
}: DropdownFieldProps) {
  const showRetry = Boolean(error) && !loading;

  return (
    <View style={[styles.formSection, { marginTop: scale(20), zIndex: open ? 2 : 0 }]}>
      <Text style={[styles.fieldLabel, { fontSize: scale(12), marginBottom: scale(8) }]}>
        {label}
      </Text>
      <View style={styles.dropdownWrap}>
        <TouchableOpacity
          style={[
            styles.dropdownTrigger,
            {
              paddingVertical: scale(12),
              paddingHorizontal: scale(14),
              borderRadius: scale(12),
            },
            open && styles.dropdownTriggerOpen,
            loading && styles.dropdownTriggerDisabled,
          ]}
          activeOpacity={0.7}
          onPress={() => {
            if (loading) {
              return;
            }
            if (showRetry && onRetry) {
              onRetry();
              return;
            }
            onToggle();
          }}
          disabled={loading}
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#93C5FD" style={{ flex: 1 }} />
          ) : (
            <Text style={[styles.dropdownValue, { fontSize: scale(16) }]}>
              {showRetry ? 'Tap to retry' : value}
            </Text>
          )}
          {!showRetry ? (
            <Ionicons
              name={open ? 'chevron-up' : 'chevron-down'}
              size={scale(18)}
              color="rgba(255,255,255,0.55)"
            />
          ) : null}
        </TouchableOpacity>

        {open ? (
          <View
            style={[
              styles.dropdownMenu,
              {
                borderRadius: scale(12),
                marginTop: scale(6),
                paddingVertical: scale(4),
              },
            ]}
          >
            {children}
          </View>
        ) : null}
      </View>
      {error && !open ? (
        <Text style={[styles.fieldError, { fontSize: scale(11), marginTop: scale(6) }]}>{error}</Text>
      ) : null}
    </View>
  );
}

type OptionRowProps = {
  label: string;
  selected: boolean;
  onPress?: () => void;
  scale: (value: number) => number;
  inMenu?: boolean;
  disabled?: boolean;
  badge?: string;
  icon?: string;
};

function OptionRow({ label, selected, onPress, scale, inMenu, disabled, badge, icon }: OptionRowProps) {
  const content = (
    <>
      <View style={styles.optionLabelWrap}>
        {icon ? <Text style={[styles.optionIcon, { fontSize: scale(16) }]}>{icon}</Text> : null}
        <Text
          style={[
            styles.optionText,
            { fontSize: scale(14) },
            selected && styles.optionTextSelected,
            disabled && styles.optionTextDisabled,
          ]}
        >
          {label}
        </Text>
      </View>
      {badge ? (
        <Text style={[styles.optionBadge, { fontSize: scale(11) }]}>{badge}</Text>
      ) : selected ? (
        <Ionicons name={inMenu ? 'checkmark' : 'checkmark-circle'} size={scale(18)} color="#60A5FA" />
      ) : null}
    </>
  );

  const rowStyle = [
    inMenu ? styles.menuOption : styles.optionRow,
    {
      paddingVertical: scale(11),
      paddingHorizontal: scale(12),
      borderRadius: inMenu ? 0 : scale(10),
    },
    selected && !disabled && (inMenu ? styles.menuOptionSelected : styles.optionRowSelected),
    disabled && styles.menuOptionDisabled,
  ];

  if (disabled) {
    return (
      <View style={rowStyle} accessibilityRole="text" accessibilityLabel={`${label}, ${badge ?? 'unavailable'}`}>
        {content}
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={rowStyle}
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      {content}
    </TouchableOpacity>
  );
}

type ProfileMetricsDetailsProps = {
  profile: PlantProfile;
  scale: (value: number) => number;
};

function ProfileMetricsDetails({ profile, scale }: ProfileMetricsDetailsProps) {
  const optimumGroupWidth = scale(118);

  const renderRow = (
    optimumLabel: string,
    optimumValue: string | number,
    toleranceValue: string | number,
  ) => (
    <View style={[styles.profileMetricRow, { gap: scale(12) }]}>
      <View style={[styles.profileMetricGroup, { width: optimumGroupWidth, gap: scale(6) }]}>
        <Text style={[styles.profileMetricLabel, { fontSize: scale(10) }]}>{optimumLabel}</Text>
        <Text style={[styles.profileMetricValue, { fontSize: scale(11) }]}>{optimumValue}</Text>
      </View>
      <View style={[styles.profileMetricGroup, { gap: scale(6) }]}>
        <Text style={[styles.profileMetricLabel, { fontSize: scale(10) }]}>Tolerance</Text>
        <Text style={[styles.profileMetricValue, { fontSize: scale(11) }]}>±{toleranceValue}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.profileMetrics, { marginTop: scale(6), gap: scale(6) }]}>
      {renderRow('Optimum pH', profile.optimum_pH, profile.pH_tolerance)}
      {renderRow('Optimum PPM', profile.optimumPPM, profile.PPM_tolerance)}
    </View>
  );
}

type ProfileBadgeProps = {
  emoji?: string;
  ionIcon?: React.ComponentProps<typeof Ionicons>['name'];
  ionColor?: string;
  isNone?: boolean;
  selected?: boolean;
  scale: (value: number) => number;
  size?: 'sm' | 'md';
};

function ProfileBadge({
  emoji,
  ionIcon,
  ionColor,
  isNone,
  selected,
  scale,
  size = 'md',
}: ProfileBadgeProps) {
  const dimension = size === 'md' ? scale(44) : scale(40);
  const iconSize = size === 'md' ? scale(24) : scale(20);

  return (
    <View
      style={[
        styles.profileEmojiBadge,
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
        },
        isNone && styles.profileEmojiBadgeNone,
        isNone && selected && styles.profileEmojiBadgeNoneSelected,
        ionIcon && styles.profileEmojiBadgeCustom,
        !isNone && !ionIcon && selected && styles.profileEmojiBadgeSelected,
        !isNone && !ionIcon && !selected && styles.profileEmojiBadgeMuted,
      ]}
    >
      {isNone ? (
        <Ionicons name="remove-circle" size={iconSize} color="#F87171" />
      ) : ionIcon ? (
        <Ionicons name={ionIcon} size={iconSize} color={ionColor ?? '#C4B5FD'} />
      ) : (
        <Text style={[styles.profileEmoji, { fontSize: iconSize - 2 }]}>{emoji}</Text>
      )}
    </View>
  );
}

type PlantProfileOptionProps = {
  name: string;
  icon?: string;
  ionIcon?: React.ComponentProps<typeof Ionicons>['name'];
  ionColor?: string;
  profile?: PlantProfile;
  subtitle?: string;
  selected: boolean;
  disabled?: boolean;
  badge?: string;
  isNone?: boolean;
  onPress?: () => void;
  scale: (value: number) => number;
};

function PlantProfileOption({
  name,
  icon,
  ionIcon,
  ionColor,
  profile,
  subtitle,
  selected,
  disabled,
  badge,
  isNone,
  onPress,
  scale,
}: PlantProfileOptionProps) {
  const row = (
    <>
      <ProfileBadge
        emoji={icon}
        ionIcon={ionIcon}
        ionColor={ionColor}
        isNone={isNone}
        selected={selected}
        scale={scale}
        size="sm"
      />
      <View style={styles.profileOptionText}>
        <Text
          style={[
            styles.profileOptionName,
            { fontSize: scale(14) },
            selected && styles.profileOptionNameSelected,
            disabled && styles.profileOptionNameDisabled,
          ]}
          numberOfLines={1}
        >
          {name}
        </Text>
        {profile ? (
          <ProfileMetricsDetails profile={profile} scale={scale} />
        ) : subtitle ? (
          <Text style={[styles.profileOptionSubtitle, { fontSize: scale(11), marginTop: scale(2) }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {badge ? (
        <View style={[styles.soonBadge, { paddingHorizontal: scale(8), paddingVertical: scale(3), borderRadius: scale(8) }]}>
          <Text style={[styles.soonBadgeText, { fontSize: scale(10) }]}>{badge}</Text>
        </View>
      ) : selected ? (
        <Ionicons name="checkmark-circle" size={scale(20)} color="#60A5FA" />
      ) : null}
    </>
  );

  const rowStyle = [
    styles.profileOption,
    {
      paddingVertical: profile ? scale(14) : scale(11),
      paddingHorizontal: scale(12),
      borderRadius: scale(12),
      marginBottom: scale(8),
      gap: scale(12),
      minHeight: profile ? scale(72) : undefined,
    },
    selected && !disabled && styles.profileOptionSelected,
    disabled && styles.profileOptionDisabled,
  ];

  if (disabled) {
    return (
      <View style={rowStyle} accessibilityRole="text">
        {row}
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={rowStyle}
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      {row}
    </TouchableOpacity>
  );
}

type PlantProfileFieldProps = {
  profiles: PlantProfile[];
  selectedId: string;
  loading: boolean;
  error: string | null;
  onSelect: (id: string) => void;
  onRetry: () => void;
  scale: (value: number) => number;
};

function PlantProfileField({
  profiles,
  selectedId,
  loading,
  error,
  onSelect,
  onRetry,
  scale,
}: PlantProfileFieldProps) {
  const showRetry = Boolean(error) && !loading;

  return (
    <View style={[styles.formSection, { marginTop: scale(12) }]}>
      <Text style={[styles.fieldLabel, { fontSize: scale(12), marginBottom: scale(10) }]}>
        Plant profile
      </Text>

      {loading ? (
        <View style={[styles.centerState, { paddingVertical: scale(32) }]}>
          <ActivityIndicator size="small" color="#93C5FD" />
        </View>
      ) : showRetry ? (
        <TouchableOpacity
          style={[styles.retryBox, { padding: scale(14), borderRadius: scale(12) }]}
          activeOpacity={0.7}
          onPress={onRetry}
        >
          <Text style={[styles.retryText, { fontSize: scale(13) }]}>{error}</Text>
          <Text style={[styles.retryAction, { fontSize: scale(13), marginTop: scale(4) }]}>Tap to retry</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.profileList}>
          <PlantProfileOption
            name="None"
            subtitle="No plant profile"
            selected={!selectedId}
            isNone
            onPress={() => onSelect('')}
            scale={scale}
          />

          {profiles.length > 0 ? (
            <View style={[styles.profileMenuDivider, { marginVertical: scale(6) }]} />
          ) : null}

          {profiles.map((profile) => (
            <PlantProfileOption
              key={profile.id}
              name={profile.name}
              icon={profile.icon}
              profile={profile}
              selected={profile.id === selectedId}
              onPress={() => onSelect(profile.id)}
              scale={scale}
            />
          ))}

          <View style={[styles.profileMenuDivider, { marginVertical: scale(6) }]} />

          <PlantProfileOption
            name="Custom profile"
            ionIcon="extension-puzzle-outline"
            ionColor="rgba(196,181,253,0.75)"
            subtitle="Define your own targets"
            selected={false}
            disabled
            badge="Soon"
            scale={scale}
          />
        </View>
      )}
    </View>
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

  const pairedDeviceIds = useMemo(() => getPairedDeviceIds(rooms), [rooms]);

  const availableDevices = useMemo(
    () => nearbyDevices.filter((device) => !pairedDeviceIds.has(device.id)),
    [nearbyDevices, pairedDeviceIds],
  );

  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === roomId) ?? getDefaultRoom(rooms),
    [roomId, rooms],
  );

  const loadPlantProfiles = useCallback(async () => {
    setLoadingProfiles(true);
    setProfilesError(null);
    try {
      const profiles = await fetchPlantProfiles();
      setPlantProfiles(profiles);
      setPlantProfileId((current) =>
        current && profiles.some((profile) => profile.id === current) ? current : '',
      );
      if (profiles.length === 0) {
        setProfilesError('No plant profiles found.');
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
      setPlantProfileId('');
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
    setPlantProfileId('');
    setStep('setup');
  };

  const handleContinueToProfile = () => {
    if (!draftName.trim() || !roomId) {
      return;
    }
    setRoomOpen(false);
    setPlantProfileId('');
    setStep('profile');
    if (plantProfiles.length === 0 && !loadingProfiles) {
      void loadPlantProfiles();
    }
  };

  const handleSave = () => {
    const trimmed = draftName.trim();
    if (!trimmed || !roomId || !selectedDevice || !plantProfileId) {
      return;
    }
    onSave(trimmed, roomId, selectedDevice, plantProfileId);
  };

  const handleBackdropPress = () => {
    if (step === 'profile') {
      setStep('setup');
      return;
    }
    if (step === 'setup') {
      setStep('pair');
      setSelectedDevice(null);
      return;
    }
    onClose();
  };

  const canContinueSetup = Boolean(draftName.trim() && roomId && selectedDevice);
  const canSave = Boolean(plantProfileId && selectedDevice && roomId && draftName.trim());

  const sheetHeight = Math.min(r.height * 0.72, r.scale(560));
  const sheetPadding = r.scale(18);

  const headerConfig = useMemo(() => {
    if (step === 'pair') {
      return {
        title: 'Pair machine',
        stepLabel: 'Step 1 of 3',
        subtitle: scanning ? 'Scanning for nearby devices…' : 'Select a device to continue',
      };
    }
    if (step === 'setup') {
      return {
        title: 'Set up machine',
        stepLabel: 'Step 2 of 3',
        subtitle: selectedDevice
          ? `${selectedDevice.model} · ${formatDeviceId(selectedDevice.id)}`
          : 'Name your machine and choose a room',
      };
    }
    return {
      title: 'Plant profile',
      stepLabel: 'Step 3 of 3',
      subtitle: `${draftName.trim() || 'Machine'} · ${selectedRoom?.name ?? 'Room'}`,
    };
  }, [step, scanning, selectedDevice, draftName, selectedRoom?.name]);

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
              padding: sheetPadding,
              maxWidth: r.contentMaxWidth,
              height: sheetHeight,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <ModalHeader
            title={headerConfig.title}
            stepLabel={headerConfig.stepLabel}
            subtitle={headerConfig.subtitle}
            onClose={onClose}
            onBack={
              step === 'setup' || step === 'profile'
                ? () => {
                    if (step === 'profile') {
                      setStep('setup');
                      return;
                    }
                    setStep('pair');
                    setSelectedDevice(null);
                  }
                : undefined
            }
            scale={r.scale}
            rightAction={
              step === 'pair' ? (
                <Pressable
                  style={[
                    styles.iconButton,
                    { width: r.scale(32), height: r.scale(32), borderRadius: r.scale(16) },
                    scanning && styles.iconButtonDisabled,
                  ]}
                  onPress={() => void loadNearbyDevices()}
                  disabled={scanning}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Refresh scan"
                >
                  {scanning ? (
                    <ActivityIndicator size="small" color="#93C5FD" />
                  ) : (
                    <Ionicons name="refresh" size={r.scale(17)} color="#fff" />
                  )}
                </Pressable>
              ) : undefined
            }
          />

          {step === 'pair' ? (
            <>
              <View
                style={[
                  styles.bluetoothBanner,
                  {
                    marginTop: r.scale(16),
                    paddingVertical: r.scale(16),
                    paddingHorizontal: r.scale(14),
                    borderRadius: r.scale(14),
                  },
                  scanning && styles.bluetoothBannerActive,
                ]}
              >
                <View
                  style={[
                    styles.bluetoothIconWrap,
                    {
                      width: r.scale(48),
                      height: r.scale(48),
                      borderRadius: r.scale(24),
                    },
                  ]}
                >
                  {scanning ? (
                    <ActivityIndicator size="small" color="#93C5FD" />
                  ) : (
                    <Ionicons name="bluetooth" size={r.scale(24)} color="#93C5FD" />
                  )}
                </View>
                <Text style={[styles.bluetoothTitle, { fontSize: r.scale(14), marginTop: r.scale(10) }]}>
                  {scanning ? 'Scanning nearby…' : 'Ready to pair'}
                </Text>
                <Text style={[styles.bluetoothHint, { fontSize: r.scale(12), marginTop: r.scale(4) }]}>
                  Keep your AEREA device powered on and nearby.
                </Text>
              </View>

              <ScrollView
                style={styles.stepBody}
                contentContainerStyle={[
                  styles.stepBodyContent,
                  { paddingTop: r.scale(14), paddingBottom: r.scale(4) },
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {scanning && availableDevices.length === 0 ? (
                  <View style={[styles.centerState, styles.stepBodyFill]}>
                    <ActivityIndicator size="small" color="#93C5FD" />
                    <Text style={[styles.centerStateText, { fontSize: r.scale(14), marginTop: r.scale(12) }]}>
                      Looking for devices…
                    </Text>
                  </View>
                ) : availableDevices.length === 0 ? (
                  <View style={[styles.centerState, styles.stepBodyFill]}>
                    <Ionicons name="bluetooth-outline" size={r.scale(28)} color="rgba(255,255,255,0.3)" />
                    <Text style={[styles.centerStateText, { fontSize: r.scale(14), marginTop: r.scale(12) }]}>
                      No devices found
                    </Text>
                    <Text style={[styles.centerStateHint, { fontSize: r.scale(12), marginTop: r.scale(6) }]}>
                      Make sure your AEREA is powered on, then tap refresh.
                    </Text>
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
            </>
          ) : step === 'setup' ? (
            <>
              <ScrollView
                style={styles.stepBody}
                contentContainerStyle={[
                  styles.stepBodyContent,
                  { paddingTop: r.scale(20), paddingBottom: r.scale(8) },
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.formSection}>
                  <Text style={[styles.fieldLabel, { fontSize: r.scale(12), marginBottom: r.scale(8) }]}>
                    Name
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        paddingVertical: r.scale(12),
                        paddingHorizontal: r.scale(14),
                        borderRadius: r.scale(12),
                        fontSize: r.scale(16),
                      },
                    ]}
                    value={draftName}
                    onChangeText={setDraftName}
                    placeholder="Machine name"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    autoFocus
                    selectTextOnFocus
                    maxLength={64}
                    returnKeyType="next"
                    onSubmitEditing={handleContinueToProfile}
                  />
                </View>

                <DropdownField
                  label="Room"
                  value={selectedRoom?.name ?? 'Select room'}
                  open={roomOpen}
                  onToggle={() => setRoomOpen((open) => !open)}
                  scale={r.scale}
                >
                  {rooms.map((room) => (
                    <OptionRow
                      key={room.id}
                      label={room.name}
                      selected={room.id === roomId}
                      inMenu
                      onPress={() => {
                        setRoomId(room.id);
                        setRoomOpen(false);
                      }}
                      scale={r.scale}
                    />
                  ))}
                </DropdownField>
              </ScrollView>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  {
                    marginTop: r.scale(12),
                    paddingVertical: r.scale(14),
                    borderRadius: r.scale(12),
                  },
                  !canContinueSetup && styles.primaryButtonDisabled,
                ]}
                activeOpacity={0.7}
                onPress={handleContinueToProfile}
                disabled={!canContinueSetup}
              >
                <Text style={[styles.primaryButtonText, { fontSize: r.scale(15) }]}>Continue</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <ScrollView
                style={styles.stepBody}
                contentContainerStyle={[
                  styles.stepBodyContent,
                  { paddingTop: r.scale(12), paddingBottom: r.scale(8) },
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <PlantProfileField
                  profiles={plantProfiles}
                  selectedId={plantProfileId}
                  loading={loadingProfiles}
                  error={profilesError}
                  onSelect={setPlantProfileId}
                  onRetry={() => void loadPlantProfiles()}
                  scale={r.scale}
                />
              </ScrollView>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  {
                    marginTop: r.scale(12),
                    paddingVertical: r.scale(14),
                    borderRadius: r.scale(12),
                  },
                  !canSave && styles.primaryButtonDisabled,
                ]}
                activeOpacity={0.7}
                onPress={handleSave}
                disabled={!canSave}
              >
                <Text style={[styles.primaryButtonText, { fontSize: r.scale(15) }]}>Add machine</Text>
              </TouchableOpacity>
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
    overflow: 'hidden',
  },
  stepBody: {
    flex: 1,
    minHeight: 0,
  },
  stepBodyContent: {
    flexGrow: 1,
  },
  stepBodyFill: {
    flex: 1,
    minHeight: 120,
    justifyContent: 'center',
    paddingVertical: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  headerSide: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  headerSideRight: {
    alignItems: 'flex-end',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  stepLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
    textAlign: 'center',
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  iconButtonDisabled: {
    opacity: 0.6,
  },
  bluetoothBanner: {
    alignItems: 'center',
    backgroundColor: 'rgba(96,165,250,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(96,165,250,0.18)',
  },
  bluetoothBannerActive: {
    borderColor: 'rgba(96,165,250,0.35)',
    backgroundColor: 'rgba(96,165,250,0.12)',
  },
  bluetoothIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(96,165,250,0.14)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(96,165,250,0.28)',
  },
  bluetoothTitle: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  bluetoothHint: {
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '500',
    textAlign: 'center',
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  deviceIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(96,165,250,0.12)',
  },
  deviceContent: {
    flex: 1,
    minWidth: 0,
  },
  deviceModel: {
    color: '#fff',
    fontWeight: '600',
  },
  deviceId: {
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '500',
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerStateText: {
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '500',
    textAlign: 'center',
  },
  centerStateHint: {
    color: 'rgba(255,255,255,0.38)',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
  },
  formSection: {},
  fieldLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '600',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  input: {
    color: '#fff',
    fontWeight: '600',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  profileList: {
    gap: 0,
  },
  retryBox: {
    backgroundColor: 'rgba(248,113,113,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(248,113,113,0.25)',
    alignItems: 'center',
  },
  retryText: {
    color: 'rgba(252,165,165,0.9)',
    fontWeight: '500',
    textAlign: 'center',
  },
  retryAction: {
    color: '#93C5FD',
    fontWeight: '600',
  },
  profileMenuDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  profileOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  profileOptionSelected: {
    backgroundColor: 'rgba(96,165,250,0.12)',
    borderColor: 'rgba(96,165,250,0.35)',
  },
  profileOptionDisabled: {
    opacity: 0.5,
    borderStyle: 'dashed',
  },
  profileEmojiBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  profileEmojiBadgeSelected: {
    backgroundColor: 'rgba(52,211,153,0.14)',
    borderColor: 'rgba(52,211,153,0.35)',
  },
  profileEmojiBadgeNone: {
    backgroundColor: 'rgba(248,113,113,0.1)',
    borderColor: 'rgba(248,113,113,0.28)',
  },
  profileEmojiBadgeNoneSelected: {
    backgroundColor: 'rgba(248,113,113,0.16)',
    borderColor: 'rgba(248,113,113,0.45)',
  },
  profileEmojiBadgeCustom: {
    backgroundColor: 'rgba(167,139,250,0.1)',
    borderColor: 'rgba(167,139,250,0.25)',
  },
  profileEmojiBadgeMuted: {
    opacity: 0.7,
  },
  profileEmojiBadgeDisabled: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  profileEmoji: {
    textAlign: 'center',
  },
  profileOptionText: {
    flex: 1,
    minWidth: 0,
  },
  profileOptionName: {
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  profileOptionNameSelected: {
    color: '#fff',
  },
  profileOptionNameDisabled: {
    color: 'rgba(255,255,255,0.5)',
  },
  profileOptionSubtitle: {
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
  },
  profileMetrics: {},
  profileMetricRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileMetricGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileMetricLabel: {
    color: 'rgba(255,255,255,0.38)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  profileMetricValue: {
    color: 'rgba(255,255,255,0.72)',
    fontWeight: '600',
  },
  soonBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  soonBadgeText: {
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  dropdownWrap: {
    position: 'relative',
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  dropdownTriggerOpen: {
    borderColor: 'rgba(96,165,250,0.4)',
  },
  dropdownTriggerDisabled: {
    opacity: 0.65,
  },
  dropdownValue: {
    color: '#fff',
    fontWeight: '600',
    flex: 1,
  },
  dropdownMenu: {
    backgroundColor: 'rgba(10,15,28,0.98)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  fieldError: {
    color: 'rgba(248,113,113,0.85)',
    fontWeight: '500',
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  optionIcon: {
    lineHeight: 20,
  },
  menuOptionSelected: {
    backgroundColor: 'rgba(96,165,250,0.12)',
  },
  menuOptionDisabled: {
    opacity: 0.55,
  },
  optionBadge: {
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  optionTextDisabled: {
    color: 'rgba(255,255,255,0.45)',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  optionRowSelected: {
    backgroundColor: 'rgba(96,165,250,0.1)',
    borderColor: 'rgba(96,165,250,0.3)',
  },
  optionText: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(96,165,250,0.25)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(96,165,250,0.45)',
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
