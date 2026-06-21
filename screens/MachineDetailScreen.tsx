import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { isDefaultRoom } from '../data/mockMachines';
import MetricHistorySection, { type MetricHistoryItem } from '../components/MetricHistorySection';
import MetricRing from '../components/MetricRing';
import { fetchPlantProfileById, fetchPlantProfiles } from '../services/plantProfiles';
import type { Machine } from '../types/machine';
import { formatDeviceId } from '../types/machine';
import type { PlantProfile } from '../types/plantProfile';
import {
  createCustomPlantProfile,
  CUSTOM_PLANT_PROFILE_ID,
  isCustomPlantProfileId,
} from '../types/plantProfile';
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
  onPlantProfileChange: (plantProfileId: string, customPlantProfile?: PlantProfile) => void;
  onAddRoom?: () => void;
  onBack: () => void;
  onRefresh?: () => Promise<void>;
};

function machineCountLabel(count: number): string {
  return count === 1 ? '1 machine' : `${count} machines`;
}

type RoomMenuOptionProps = {
  room: Room;
  selected: boolean;
  scale: (value: number) => number;
  onPress: () => void;
};

function RoomMenuOption({ room, selected, scale, onPress }: RoomMenuOptionProps) {
  const isDefault = isDefaultRoom(room.id);

  return (
    <TouchableOpacity
      style={[
        styles.roomOption,
        {
          paddingVertical: scale(11),
          paddingHorizontal: scale(12),
          borderRadius: scale(10),
          marginHorizontal: scale(6),
          marginBottom: scale(4),
          gap: scale(10),
        },
        selected && styles.roomOptionSelected,
        selected && { borderLeftWidth: scale(3), borderLeftColor: '#60A5FA' },
      ]}
      activeOpacity={0.75}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${room.name}, ${machineCountLabel(room.machines.length)}`}
    >
      <View
        style={[
          styles.roomOptionIcon,
          {
            width: scale(34),
            height: scale(34),
            borderRadius: scale(17),
          },
          selected && styles.roomOptionIconSelected,
        ]}
      >
        <Ionicons
          name={isDefault ? 'archive-outline' : 'layers-outline'}
          size={scale(16)}
          color={selected ? '#93C5FD' : 'rgba(255,255,255,0.55)'}
        />
      </View>

      <View style={styles.roomOptionContent}>
        <Text
          style={[
            styles.roomOptionText,
            { fontSize: scale(14) },
            selected && styles.roomOptionTextSelected,
          ]}
          numberOfLines={1}
        >
          {room.name}
        </Text>
        <Text style={[styles.roomOptionMeta, { fontSize: scale(11), marginTop: scale(2) }]}>
          {machineCountLabel(room.machines.length)}
        </Text>
      </View>

      {selected ? (
        <View
          style={[
            styles.roomOptionCheck,
            { width: scale(22), height: scale(22), borderRadius: scale(11) },
          ]}
        >
          <Ionicons name="checkmark" size={scale(13)} color="#fff" />
        </View>
      ) : (
        <View style={{ width: scale(22) }} />
      )}
    </TouchableOpacity>
  );
}

type ProfileModalStep = 'details' | 'change' | 'edit';

type ProfileEditDraft = {
  optimum_pH: string;
  pH_tolerance: string;
  optimumPPM: string;
  PPM_tolerance: string;
};

function profileToEditDraft(profile: PlantProfile): ProfileEditDraft {
  return {
    optimum_pH: String(profile.optimum_pH),
    pH_tolerance: String(profile.pH_tolerance),
    optimumPPM: String(profile.optimumPPM),
    PPM_tolerance: String(profile.PPM_tolerance),
  };
}

function ProfileCriticalWarning({ scale }: { scale: (value: number) => number }) {
  return (
    <View
      style={[
        styles.profileWarning,
        {
          padding: scale(12),
          borderRadius: scale(10),
          gap: scale(8),
          marginTop: scale(14),
        },
      ]}
    >
      <Ionicons name="warning-outline" size={scale(18)} color="#FBBF24" />
      <Text style={[styles.profileWarningText, { fontSize: scale(12), lineHeight: scale(17) }]}>
        This setting controls nutrient targets and dosing behavior. Changing it incorrectly can
        seriously affect plant health. Proceed only if you are sure.
      </Text>
    </View>
  );
}

type PlantProfileSummaryProps = {
  profile: PlantProfile | null;
  loading: boolean;
  plantProfileId?: string;
  profiles: PlantProfile[];
  loadingProfiles: boolean;
  scale: (value: number) => number;
  compact?: boolean;
  onChangeProfile: (profileId: string) => void;
  onSaveCustomProfile: (profile: PlantProfile) => void;
};

type ProfileDetailsColumnsProps = {
  profile: PlantProfile;
  scale: (value: number) => number;
};

function ProfileDetailsColumns({ profile, scale }: ProfileDetailsColumnsProps) {
  const renderMetric = (label: string, value: string) => (
    <View style={{ gap: scale(3) }}>
      <Text style={[styles.profileColumnMetricLabel, { fontSize: scale(11) }]}>{label}</Text>
      <Text style={[styles.profileColumnMetricValue, { fontSize: scale(16) }]}>{value}</Text>
    </View>
  );

  const renderToleranceMetric = (label: string, value: string | number) => (
    <View style={{ gap: scale(3) }}>
      <Text style={[styles.profileColumnMetricLabel, { fontSize: scale(11) }]}>{label}</Text>
      <View style={[styles.profileToleranceValue, { gap: scale(6) }]}>
        <Text style={[styles.profileToleranceSign, { fontSize: scale(16) }]}>±</Text>
        <Text style={[styles.profileColumnMetricValue, { fontSize: scale(16) }]}>{value}</Text>
      </View>
    </View>
  );

  return (
    <View style={{ marginTop: scale(18) }}>
      <View style={[styles.profileColumnsHeader, { gap: scale(12), marginBottom: scale(12) }]}>
        <Text style={[styles.profileColumnHeader, { fontSize: scale(11), flex: 1 }]}>Optimum</Text>
        <Text style={[styles.profileColumnHeader, { fontSize: scale(11), flex: 1 }]}>Tolerances</Text>
      </View>

      <View style={[styles.profileColumnsBody, { gap: scale(12) }]}>
        <View style={[styles.profileColumn, { flex: 1, gap: scale(12) }]}>
          {renderMetric('pH', String(profile.optimum_pH))}
          {renderMetric('ppm', String(profile.optimumPPM))}
        </View>

        <View style={styles.profileColumnDivider} />

        <View style={[styles.profileColumn, { flex: 1, gap: scale(12) }]}>
          {renderToleranceMetric('pH', profile.pH_tolerance)}
          {renderToleranceMetric('ppm', profile.PPM_tolerance)}
        </View>
      </View>
    </View>
  );
}

function PlantProfileSummary({
  profile,
  loading,
  plantProfileId,
  profiles,
  loadingProfiles,
  scale,
  compact = false,
  onChangeProfile,
  onSaveCustomProfile,
}: PlantProfileSummaryProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [step, setStep] = useState<ProfileModalStep>('details');
  const [editDraft, setEditDraft] = useState<ProfileEditDraft>(() =>
    profileToEditDraft(createCustomPlantProfile()),
  );

  const isCustom = isCustomPlantProfileId(plantProfileId);
  const displayProfile = profile ?? (isCustom ? createCustomPlantProfile() : null);

  const closeDetails = () => {
    setDetailsOpen(false);
    setStep('details');
  };

  const openDetails = () => {
    if (displayProfile) {
      setEditDraft(profileToEditDraft(displayProfile));
    }
    setStep('details');
    setDetailsOpen(true);
  };

  const openEdit = () => {
    setEditDraft(profileToEditDraft(displayProfile ?? createCustomPlantProfile()));
    setStep('edit');
  };

  const handleSaveCustom = () => {
    const optimum_pH = Number(editDraft.optimum_pH);
    const pH_tolerance = Number(editDraft.pH_tolerance);
    const optimumPPM = Number(editDraft.optimumPPM);
    const PPM_tolerance = Number(editDraft.PPM_tolerance);

    if (
      Number.isNaN(optimum_pH) ||
      Number.isNaN(pH_tolerance) ||
      Number.isNaN(optimumPPM) ||
      Number.isNaN(PPM_tolerance)
    ) {
      return;
    }

    Alert.alert(
      'Save custom profile?',
      'This will switch this machine to a custom profile and update its nutrient targets. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          style: 'destructive',
          onPress: () => {
            onSaveCustomProfile(
              createCustomPlantProfile({
                optimum_pH,
                pH_tolerance,
                optimumPPM,
                PPM_tolerance,
              }),
            );
            closeDetails();
          },
        },
      ],
    );
  };

  const handleSelectProfile = (nextProfile: PlantProfile) => {
    if (nextProfile.id === plantProfileId) {
      return;
    }

    Alert.alert(
      'Change plant profile?',
      `Switch this machine to "${nextProfile.name}"? This will update nutrient targets and dosing behavior.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Change',
          style: 'destructive',
          onPress: () => {
            onChangeProfile(nextProfile.id);
            closeDetails();
          },
        },
      ],
    );
  };

  const badgeSize = scale(compact ? 28 : 40);
  const badgeRadius = badgeSize / 2;
  const emojiSize = scale(compact ? 15 : 20);
  const nameSize = scale(compact ? 14 : 15);
  const iconSize = scale(compact ? 14 : 16);

  const renderProfileBadge = () => {
    if (isCustom) {
      return (
        <View
          style={[
            styles.profileEmojiBadge,
            styles.profileEmojiBadgeCustom,
            { width: badgeSize, height: badgeSize, borderRadius: badgeRadius },
          ]}
        >
          <Ionicons name="extension-puzzle-outline" size={emojiSize} color="#C4B5FD" />
        </View>
      );
    }

    if (displayProfile) {
      return (
        <View
          style={[
            styles.profileEmojiBadge,
            styles.profileEmojiBadgeActive,
            { width: badgeSize, height: badgeSize, borderRadius: badgeRadius },
          ]}
        >
          <Text style={[styles.profileEmoji, { fontSize: emojiSize }]}>{displayProfile.icon}</Text>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.profileEmojiBadge,
          styles.profileEmojiBadgeNone,
          { width: badgeSize, height: badgeSize, borderRadius: badgeRadius },
        ]}
      >
        <Ionicons name="remove-circle" size={emojiSize} color="#F87171" />
      </View>
    );
  };

  const profileLabel = displayProfile?.name ?? 'None';

  const profileControl = loading ? (
    <View style={[styles.contextControl, compact && { minHeight: scale(28) }]}>
      <ActivityIndicator size="small" color="#93C5FD" />
    </View>
  ) : (
    <TouchableOpacity
      style={[styles.contextControl, compact && { minHeight: scale(28) }]}
      activeOpacity={0.7}
      onPress={openDetails}
      accessibilityRole="button"
      accessibilityLabel={
        displayProfile
          ? `Plant profile ${profileLabel}, view details`
          : 'No plant profile, change profile'
      }
    >
      {renderProfileBadge()}
      <Text style={[styles.profileSummaryName, { fontSize: nameSize, flex: 1 }]} numberOfLines={1}>
        {profileLabel}
      </Text>
      <Ionicons name="chevron-forward" size={iconSize} color="rgba(255,255,255,0.35)" />
    </TouchableOpacity>
  );

  const renderModalHeader = (title: string, onBack?: () => void) => (
    <View style={styles.renameHeader}>
      <View style={[styles.profileModalHeader, { gap: scale(10), flex: 1, minWidth: 0 }]}>
        {onBack ? (
          <Pressable
            style={[
              styles.headerIconButton,
              { width: scale(32), height: scale(32), borderRadius: scale(16) },
            ]}
            onPress={onBack}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={scale(18)} color="#fff" />
          </Pressable>
        ) : displayProfile ? (
          isCustom ? (
            <View
              style={[
                styles.profileEmojiBadge,
                styles.profileEmojiBadgeCustom,
                { width: scale(40), height: scale(40), borderRadius: scale(20) },
              ]}
            >
              <Ionicons name="extension-puzzle-outline" size={scale(20)} color="#C4B5FD" />
            </View>
          ) : (
            <View
              style={[
                styles.profileEmojiBadge,
                styles.profileEmojiBadgeActive,
                { width: scale(40), height: scale(40), borderRadius: scale(20) },
              ]}
            >
              <Text style={[styles.profileEmoji, { fontSize: scale(20) }]}>{displayProfile.icon}</Text>
            </View>
          )
        ) : null}
        <Text style={[styles.renameTitle, { fontSize: scale(18), flex: 1 }]} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <Pressable
        style={[
          styles.headerIconButton,
          { width: scale(32), height: scale(32), borderRadius: scale(16) },
        ]}
        onPress={closeDetails}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Close plant profile dialog"
      >
        <Ionicons name="close" size={scale(18)} color="#fff" />
      </Pressable>
    </View>
  );

  const renderChangeStep = () => (
    <>
      {renderModalHeader('Change profile', () => setStep('details'))}
      <ProfileCriticalWarning scale={scale} />
      {loadingProfiles ? (
        <ActivityIndicator size="small" color="#93C5FD" style={{ marginTop: scale(20) }} />
      ) : (
        <ScrollView
          style={{ maxHeight: scale(280), marginTop: scale(14) }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {profiles.map((item) => {
            const selected = item.id === plantProfileId;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.profilePickerOption,
                  {
                    paddingVertical: scale(11),
                    paddingHorizontal: scale(12),
                    borderRadius: scale(10),
                    marginBottom: scale(6),
                    gap: scale(10),
                  },
                  selected && styles.profilePickerOptionSelected,
                ]}
                activeOpacity={0.75}
                onPress={() => handleSelectProfile(item)}
                disabled={selected}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <View
                  style={[
                    styles.profileEmojiBadge,
                    styles.profileEmojiBadgeActive,
                    { width: scale(32), height: scale(32), borderRadius: scale(16) },
                  ]}
                >
                  <Text style={[styles.profileEmoji, { fontSize: scale(16) }]}>{item.icon}</Text>
                </View>
                <Text
                  style={[styles.profilePickerOptionText, { fontSize: scale(14), flex: 1 }]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                {selected ? (
                  <Ionicons name="checkmark-circle" size={scale(18)} color="#60A5FA" />
                ) : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </>
  );

  const renderEditStep = () => (
    <>
      {renderModalHeader('Edit profile', () => setStep('details'))}
      <ProfileCriticalWarning scale={scale} />
      <Text style={[styles.profileEditHint, { fontSize: scale(12), marginTop: scale(12) }]}>
        Saving will switch this machine to a custom profile.
      </Text>
      <View style={{ marginTop: scale(14), gap: scale(10) }}>
        {(
          [
            ['Optimum pH', 'optimum_pH'],
            ['pH tolerance', 'pH_tolerance'],
            ['Optimum ppm', 'optimumPPM'],
            ['ppm tolerance', 'PPM_tolerance'],
          ] as const
        ).map(([label, key]) => (
          <View key={key} style={{ gap: scale(6) }}>
            <Text style={[styles.profileEditLabel, { fontSize: scale(11) }]}>{label}</Text>
            <TextInput
              style={[
                styles.profileEditInput,
                {
                  paddingVertical: scale(10),
                  paddingHorizontal: scale(12),
                  borderRadius: scale(10),
                  fontSize: scale(15),
                },
              ]}
              value={editDraft[key]}
              onChangeText={(value) => setEditDraft((current) => ({ ...current, [key]: value }))}
              keyboardType="decimal-pad"
              placeholderTextColor="rgba(255,255,255,0.35)"
            />
          </View>
        ))}
      </View>
      <TouchableOpacity
        style={[
          styles.profileModalButton,
          styles.profileModalButtonPrimary,
          { marginTop: scale(16), borderRadius: scale(12), paddingVertical: scale(12) },
        ]}
        activeOpacity={0.7}
        onPress={handleSaveCustom}
      >
        <Text style={[styles.profileModalButtonText, styles.profileModalButtonTextPrimary, { fontSize: scale(15) }]}>
          Save custom profile
        </Text>
      </TouchableOpacity>
    </>
  );

  const renderDetailsStep = () => (
    <>
      {renderModalHeader(displayProfile?.name ?? 'Plant profile')}
      {displayProfile ? <ProfileDetailsColumns profile={displayProfile} scale={scale} /> : null}
      <ProfileCriticalWarning scale={scale} />
      <View style={[styles.profileModalActions, { marginTop: scale(16), gap: scale(10) }]}>
        {displayProfile ? (
          <TouchableOpacity
            style={[styles.profileModalButton, styles.profileModalButtonSecondary, { borderRadius: scale(12), paddingVertical: scale(12), flex: 1 }]}
            activeOpacity={0.7}
            onPress={openEdit}
          >
            <Text style={[styles.profileModalButtonText, { fontSize: scale(15) }]}>Edit</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={[
            styles.profileModalButton,
            styles.profileModalButtonPrimary,
            {
              borderRadius: scale(12),
              paddingVertical: scale(12),
              flex: displayProfile ? 1 : undefined,
            },
          ]}
          activeOpacity={0.7}
          onPress={() => setStep('change')}
        >
          <Text style={[styles.profileModalButtonText, styles.profileModalButtonTextPrimary, { fontSize: scale(15) }]}>
            Change profile
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const detailsModal = (
    <Modal visible={detailsOpen} transparent animationType="fade" onRequestClose={closeDetails}>
      <Pressable style={styles.renameBackdrop} onPress={closeDetails}>
        <Pressable
          style={[
            styles.renameSheet,
            {
              borderRadius: scale(18),
              padding: scale(18),
              maxWidth: scale(320),
            },
          ]}
          onPress={(event) => event.stopPropagation()}
        >
          {step === 'change'
            ? renderChangeStep()
            : step === 'edit'
              ? renderEditStep()
              : renderDetailsStep()}
        </Pressable>
      </Pressable>
    </Modal>
  );

  if (compact) {
    return (
      <>
        <View
          style={[
            styles.contextRow,
            {
              paddingVertical: scale(8),
              paddingHorizontal: scale(12),
              gap: scale(10),
            },
          ]}
        >
          <Text style={[styles.contextLabel, { fontSize: scale(11), width: scale(56) }]}>Profile</Text>
          {profileControl}
        </View>
        {detailsModal}
      </>
    );
  }

  return (
    <View style={{ marginTop: scale(14) }}>
      <Text style={[styles.sectionLabel, { fontSize: scale(11), marginBottom: scale(8) }]}>
        Plant profile
      </Text>
      <View
        style={[
          styles.profileCard,
          {
            paddingVertical: scale(12),
            paddingHorizontal: scale(14),
            borderRadius: scale(12),
            gap: scale(12),
          },
        ]}
      >
        {profileControl}
      </View>
      {detailsModal}
    </View>
  );
}

export default function MachineDetailScreen({
  machine,
  roomId,
  roomName,
  rooms,
  onRoomChange,
  onNameChange,
  onPlantProfileChange,
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
  const [plantProfile, setPlantProfile] = useState<PlantProfile | null>(null);
  const [loadingPlantProfile, setLoadingPlantProfile] = useState(false);
  const [availableProfiles, setAvailableProfiles] = useState<PlantProfile[]>([]);
  const [loadingAvailableProfiles, setLoadingAvailableProfiles] = useState(false);

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

  useEffect(() => {
    let cancelled = false;
    setLoadingAvailableProfiles(true);

    void fetchPlantProfiles()
      .then((profiles) => {
        if (!cancelled) {
          setAvailableProfiles(profiles);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingAvailableProfiles(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!machine.plantProfileId) {
      setPlantProfile(null);
      setLoadingPlantProfile(false);
      return;
    }

    if (isCustomPlantProfileId(machine.plantProfileId)) {
      setPlantProfile(machine.customPlantProfile ?? createCustomPlantProfile());
      setLoadingPlantProfile(false);
      return;
    }

    let cancelled = false;
    setLoadingPlantProfile(true);

    void fetchPlantProfileById(machine.plantProfileId)
      .then((profile) => {
        if (!cancelled) {
          setPlantProfile(profile);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingPlantProfile(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [machine.customPlantProfile, machine.plantProfileId]);

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
              borderRadius: r.scale(14),
              padding: r.scale(12),
              borderColor: statusBorder,
            },
          ]}
        >
          <View style={[styles.identityRow, { gap: r.scale(10) }]}>
            <View
              style={[
                styles.deviceIconWrap,
                {
                  width: r.scale(42),
                  height: r.scale(42),
                  borderRadius: r.scale(21),
                },
              ]}
            >
              <Ionicons name="hardware-chip-outline" size={r.scale(20)} color="#93C5FD" />
            </View>

            <View style={styles.identityContent}>
              <Text style={[styles.deviceModel, { fontSize: r.scale(16) }]} numberOfLines={1}>
                {machine.model}
              </Text>
              <Text style={[styles.deviceId, { fontSize: r.scale(12), marginTop: r.scale(2) }]}>
                {formatDeviceId(machine.deviceId)}
              </Text>
            </View>

            <View
              style={[
                styles.statusPill,
                {
                  paddingVertical: r.scale(5),
                  paddingHorizontal: r.scale(9),
                  borderRadius: r.scale(20),
                  gap: r.scale(5),
                  backgroundColor: statusBg,
                  borderColor: statusBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  {
                    width: r.scale(6),
                    height: r.scale(6),
                    borderRadius: r.scale(3),
                    backgroundColor: statusColor,
                  },
                ]}
              />
              <Text style={[styles.statusPillText, { fontSize: r.scale(11), color: statusColor }]}>
                {machine.online ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>

          <View style={[styles.cardDivider, { marginVertical: r.scale(10) }]} />

          <View
            style={[
              styles.contextSection,
              {
                borderRadius: r.scale(10),
                zIndex: roomOpen ? 2 : 0,
              },
            ]}
          >
            <View style={styles.roomPickerWrap}>
              <View
                style={[
                  styles.contextRow,
                  {
                    paddingVertical: r.scale(8),
                    paddingHorizontal: r.scale(12),
                    gap: r.scale(10),
                  },
                  roomOpen && styles.contextRowActive,
                ]}
              >
                <Text style={[styles.contextLabel, { fontSize: r.scale(11), width: r.scale(56) }]}>
                  Room
                </Text>
                <TouchableOpacity
                  style={styles.contextControl}
                  activeOpacity={0.7}
                  onPress={() => setRoomOpen((open) => !open)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: roomOpen }}
                  accessibilityLabel={`Room ${roomName}, change room`}
                >
                  <Ionicons name="layers-outline" size={r.scale(14)} color="rgba(255,255,255,0.5)" />
                  <Text style={[styles.roomPickerText, { fontSize: r.scale(14), flex: 1 }]} numberOfLines={1}>
                    {roomName}
                  </Text>
                  <Ionicons
                    name={roomOpen ? 'chevron-up' : 'chevron-down'}
                    size={r.scale(14)}
                    color="rgba(255,255,255,0.45)"
                  />
                </TouchableOpacity>
              </View>

              {roomOpen && (
                <View
                  style={[
                    styles.roomDropdown,
                    {
                      borderRadius: r.scale(12),
                      marginTop: r.scale(4),
                      marginHorizontal: r.scale(6),
                      marginBottom: r.scale(6),
                      paddingTop: r.scale(6),
                      paddingBottom: r.scale(6),
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.roomDropdownHeader,
                      {
                        paddingHorizontal: r.scale(14),
                        paddingBottom: r.scale(8),
                        marginBottom: r.scale(4),
                      },
                    ]}
                  >
                    <Text style={[styles.roomDropdownTitle, { fontSize: r.scale(11) }]}>
                      Select room
                    </Text>
                    <Text style={[styles.roomDropdownCount, { fontSize: r.scale(11) }]}>
                      {rooms.length} rooms
                    </Text>
                  </View>

                  <ScrollView
                    style={{ maxHeight: r.scale(240) }}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled
                    keyboardShouldPersistTaps="handled"
                  >
                    {rooms.map((room) => (
                      <RoomMenuOption
                        key={room.id}
                        room={room}
                        selected={room.id === roomId}
                        scale={r.scale}
                        onPress={() => handleRoomSelect(room.id)}
                      />
                    ))}
                  </ScrollView>

                  {onAddRoom ? (
                    <>
                      <View
                        style={[
                          styles.roomOptionDivider,
                          { marginHorizontal: r.scale(12), marginVertical: r.scale(6) },
                        ]}
                      />
                      <TouchableOpacity
                        style={[
                          styles.roomOptionAdd,
                          {
                            marginHorizontal: r.scale(6),
                            paddingVertical: r.scale(11),
                            paddingHorizontal: r.scale(12),
                            borderRadius: r.scale(10),
                            gap: r.scale(8),
                          },
                        ]}
                        activeOpacity={0.75}
                        onPress={handleAddRoomPress}
                        accessibilityRole="button"
                        accessibilityLabel="Add room"
                      >
                        <View
                          style={[
                            styles.roomAddIcon,
                            { width: r.scale(28), height: r.scale(28), borderRadius: r.scale(14) },
                          ]}
                        >
                          <Ionicons name="add" size={r.scale(16)} color="#93C5FD" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.roomOptionAddText, { fontSize: r.scale(14) }]}>
                            Add room
                          </Text>
                          <Text style={[styles.roomOptionAddHint, { fontSize: r.scale(11), marginTop: r.scale(1) }]}>
                            Create a new room for this machine
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={r.scale(14)} color="rgba(147,197,253,0.55)" />
                      </TouchableOpacity>
                    </>
                  ) : null}
                </View>
              )}
            </View>

            <View style={styles.contextDivider} />

            <PlantProfileSummary
              profile={plantProfile}
              loading={loadingPlantProfile}
              plantProfileId={machine.plantProfileId}
              profiles={availableProfiles}
              loadingProfiles={loadingAvailableProfiles}
              scale={r.scale}
              compact
              onChangeProfile={(profileId) => onPlantProfileChange(profileId)}
              onSaveCustomProfile={(customProfile) =>
                onPlantProfileChange(CUSTOM_PLANT_PROFILE_ID, customProfile)
              }
            />
          </View>

          <View style={[styles.cardDivider, { marginVertical: r.scale(10) }]} />

          <View style={[styles.metaRow, { gap: r.scale(6) }]}>
            <Ionicons name="time-outline" size={r.scale(14)} color="rgba(255,255,255,0.4)" />
            <Text style={[styles.metaLabel, { fontSize: r.scale(11) }]}>
              {machine.online ? 'Updated' : 'Last seen'}
            </Text>
            <Text style={[styles.metaValue, { fontSize: r.scale(11), flex: 1, textAlign: 'right' }]}>
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
  contextSection: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    overflow: 'visible',
  },
  contextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contextRowActive: {
    backgroundColor: 'rgba(96,165,250,0.06)',
  },
  contextLabel: {
    color: 'rgba(255,255,255,0.42)',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  contextControl: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  contextDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 12,
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
  roomPickerText: {
    color: '#fff',
    fontWeight: '600',
  },
  roomDropdown: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(96,165,250,0.22)',
    backgroundColor: 'rgba(8,12,22,0.98)',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 14,
  },
  roomDropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  roomDropdownTitle: {
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  roomDropdownCount: {
    color: 'rgba(255,255,255,0.32)',
    fontWeight: '600',
  },
  roomOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomOptionSelected: {
    backgroundColor: 'rgba(96,165,250,0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(96,165,250,0.22)',
  },
  roomOptionIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  roomOptionIconSelected: {
    backgroundColor: 'rgba(96,165,250,0.16)',
    borderColor: 'rgba(96,165,250,0.28)',
  },
  roomOptionContent: {
    flex: 1,
    minWidth: 0,
  },
  roomOptionText: {
    color: 'rgba(255,255,255,0.88)',
    fontWeight: '600',
  },
  roomOptionMeta: {
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
  },
  roomOptionTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  roomOptionCheck: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
  },
  roomOptionDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  roomOptionAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(96,165,250,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(96,165,250,0.18)',
  },
  roomAddIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(96,165,250,0.14)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(96,165,250,0.25)',
  },
  roomOptionAddText: {
    color: '#BFDBFE',
    fontWeight: '700',
  },
  roomOptionAddHint: {
    color: 'rgba(147,197,253,0.55)',
    fontWeight: '500',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(52,211,153,0.18)',
    backgroundColor: 'rgba(52,211,153,0.06)',
  },
  profileEmojiBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  profileEmojiBadgeActive: {
    backgroundColor: 'rgba(52,211,153,0.14)',
    borderColor: 'rgba(52,211,153,0.35)',
  },
  profileEmojiBadgeNone: {
    backgroundColor: 'rgba(248,113,113,0.1)',
    borderColor: 'rgba(248,113,113,0.28)',
  },
  profileEmojiBadgeCustom: {
    backgroundColor: 'rgba(196,181,253,0.12)',
    borderColor: 'rgba(196,181,253,0.28)',
  },
  profileEmoji: {
    textAlign: 'center',
  },
  profileSummaryName: {
    color: '#fff',
    fontWeight: '700',
  },
  profileModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileColumnsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileColumnHeader: {
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  profileColumnsBody: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  profileColumn: {},
  profileColumnDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  profileColumnMetricLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '600',
  },
  profileColumnMetricValue: {
    color: '#fff',
    fontWeight: '700',
  },
  profileToleranceValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  profileToleranceSign: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 1,
  },
  profileWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(251,191,36,0.1)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(251,191,36,0.28)',
  },
  profileWarningText: {
    flex: 1,
    color: 'rgba(255,255,255,0.78)',
    fontWeight: '500',
  },
  profileModalActions: {
    flexDirection: 'row',
  },
  profileModalButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  profileModalButtonSecondary: {
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  profileModalButtonPrimary: {
    borderColor: 'rgba(96,165,250,0.45)',
    backgroundColor: 'rgba(96,165,250,0.18)',
  },
  profileModalButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  profileModalButtonTextPrimary: {
    color: '#BFDBFE',
  },
  profilePickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  profilePickerOptionSelected: {
    backgroundColor: 'rgba(96,165,250,0.1)',
    borderColor: 'rgba(96,165,250,0.28)',
  },
  profilePickerOptionText: {
    color: '#fff',
    fontWeight: '600',
  },
  profileEditHint: {
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
  profileEditLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  profileEditInput: {
    color: '#fff',
    fontWeight: '600',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.16)',
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
