import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { DEFAULT_ROOM_NAME } from '../data/mockMachines';
import {
  DEFAULT_ROOM_COLOR_ID,
  ROOM_COLORS,
  type RoomColorId,
} from '../constants/roomColors';
import type { Machine } from '../types/machine';
import { useResponsive } from '../utils/responsive';

type Props = {
  visible: boolean;
  mode?: 'add' | 'edit';
  roomName: string;
  position: number;
  totalRooms: number;
  roomColorId?: RoomColorId;
  machines?: Machine[];
  machineCount?: number;
  onClose: () => void;
  onSave: (name: string, position: number, colorId: RoomColorId, machines: Machine[]) => void;
  onDelete?: () => void;
};

export default function RoomEditModal({
  visible,
  mode = 'edit',
  roomName,
  position,
  totalRooms,
  roomColorId = DEFAULT_ROOM_COLOR_ID,
  machines = [],
  machineCount = 0,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const r = useResponsive();
  const [draftName, setDraftName] = useState(roomName);
  const [draftPosition, setDraftPosition] = useState(position);
  const [draftColorId, setDraftColorId] = useState<RoomColorId>(roomColorId);
  const [draftMachines, setDraftMachines] = useState<Machine[]>(machines);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (visible) {
      setDraftName(roomName);
      setDraftPosition(position);
      setDraftColorId(roomColorId);
      setDraftMachines(machines);
      setConfirmDeleteOpen(false);
    }
  }, [visible, roomName, position, roomColorId, machines]);

  const moveUp = () => {
    setDraftPosition((current) => Math.max(1, current - 1));
  };

  const moveDown = () => {
    setDraftPosition((current) => Math.min(totalRooms, current + 1));
  };

  const moveMachineUp = (index: number) => {
    if (index <= 0) {
      return;
    }
    setDraftMachines((current) => {
      const next = [...current];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveMachineDown = (index: number) => {
    setDraftMachines((current) => {
      if (index >= current.length - 1) {
        return current;
      }
      const next = [...current];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const handleSave = () => {
    const trimmed = draftName.trim();
    if (!trimmed) {
      return;
    }
    onSave(trimmed, draftPosition, draftColorId, draftMachines);
  };

  const handleDeletePress = () => {
    if (!onDelete || totalRooms <= 1) {
      return;
    }
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    setConfirmDeleteOpen(false);
    onDelete?.();
  };

  const canDelete = mode === 'edit' && !!onDelete && totalRooms > 1;
  const displayRoomName = draftName.trim() || roomName;

  const handleBackdropPress = () => {
    if (confirmDeleteOpen) {
      setConfirmDeleteOpen(false);
      return;
    }
    onClose();
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleBackdropPress}
    >
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
          {confirmDeleteOpen ? (
            <>
              <View style={styles.header}>
                <Pressable
                  style={[
                    styles.backButton,
                    { width: r.scale(32), height: r.scale(32), borderRadius: r.scale(16) },
                  ]}
                  onPress={() => setConfirmDeleteOpen(false)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Back to edit room"
                >
                  <Ionicons name="chevron-back" size={r.scale(18)} color="#fff" />
                </Pressable>
                <Text style={[styles.title, styles.confirmTitle, { fontSize: r.scale(18) }]}>
                  Delete room?
                </Text>
                <Pressable
                  style={[
                    styles.closeButton,
                    { width: r.scale(32), height: r.scale(32), borderRadius: r.scale(16) },
                  ]}
                  onPress={onClose}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Close delete room dialog"
                >
                  <Ionicons name="close" size={r.scale(18)} color="#fff" />
                </Pressable>
              </View>

              <View
                style={[
                  styles.confirmIconWrap,
                  {
                    width: r.scale(52),
                    height: r.scale(52),
                    borderRadius: r.scale(26),
                    marginTop: r.scale(20),
                  },
                ]}
              >
                <Ionicons name="trash-outline" size={r.scale(24)} color="#FCA5A5" />
              </View>

              <Text
                style={[
                  styles.confirmMessage,
                  { fontSize: r.scale(14), marginTop: r.scale(16), lineHeight: r.scale(21) },
                ]}
              >
                <Text style={styles.confirmMessageMuted}>Room </Text>
                <Text style={styles.confirmMessageStrong}>"{displayRoomName}"</Text>
                <Text style={styles.confirmMessageMuted}> will be permanently deleted.</Text>
              </Text>

              {machineCount > 0 ? (
                <View
                  style={[
                    styles.moveInfoCard,
                    {
                      marginTop: r.scale(16),
                      paddingVertical: r.scale(12),
                      paddingHorizontal: r.scale(14),
                      borderRadius: r.scale(12),
                      gap: r.scale(10),
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.moveInfoIcon,
                      { width: r.scale(32), height: r.scale(32), borderRadius: r.scale(16) },
                    ]}
                  >
                    <Ionicons name="hardware-chip-outline" size={r.scale(16)} color="#93C5FD" />
                  </View>
                  <View style={styles.moveInfoContent}>
                    <Text style={[styles.moveInfoTitle, { fontSize: r.scale(13) }]}>
                      {machineCount} machine{machineCount === 1 ? '' : 's'} will be kept
                    </Text>
                    <View style={[styles.moveInfoRow, { marginTop: r.scale(4), gap: r.scale(6) }]}>
                      <Text style={[styles.moveInfoDetail, { fontSize: r.scale(12) }]}>
                        Moved to
                      </Text>
                      <View style={[styles.moveInfoBadge, { paddingHorizontal: r.scale(8), paddingVertical: r.scale(3), borderRadius: r.scale(8) }]}>
                        <Text style={[styles.moveInfoBadgeText, { fontSize: r.scale(11) }]}>
                          {DEFAULT_ROOM_NAME}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="arrow-forward" size={r.scale(16)} color="rgba(255,255,255,0.35)" />
                </View>
              ) : null}

              <Text
                style={[
                  styles.confirmFootnote,
                  { fontSize: r.scale(12), marginTop: r.scale(14), lineHeight: r.scale(17) },
                ]}
              >
                This action cannot be undone.
              </Text>

              <View style={[styles.actions, { marginTop: r.scale(20), gap: r.scale(10) }]}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonSecondary, { borderRadius: r.scale(12) }]}
                  activeOpacity={0.7}
                  onPress={() => setConfirmDeleteOpen(false)}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel delete room"
                >
                  <Text style={[styles.actionText, { fontSize: r.scale(15) }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonDanger, { borderRadius: r.scale(12) }]}
                  activeOpacity={0.7}
                  onPress={handleConfirmDelete}
                  accessibilityRole="button"
                  accessibilityLabel={`Confirm delete ${displayRoomName}`}
                >
                  <Text style={[styles.actionText, styles.actionTextDanger, { fontSize: r.scale(15) }]}>
                    Delete room
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
          <View style={styles.header}>
            <Text style={[styles.title, { fontSize: r.scale(18) }]}>
              {mode === 'add' ? 'Add room' : 'Edit room'}
            </Text>
            <Pressable
              style={[
                styles.closeButton,
                { width: r.scale(32), height: r.scale(32), borderRadius: r.scale(16) },
              ]}
              onPress={onClose}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={mode === 'add' ? 'Close add room dialog' : 'Close edit room dialog'}
            >
              <Ionicons name="close" size={r.scale(18)} color="#fff" />
            </Pressable>
          </View>

          <ScrollView
            style={{ maxHeight: r.scale(480) }}
            contentContainerStyle={{ paddingBottom: r.scale(4) }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
          <Text style={[styles.fieldLabel, { fontSize: r.scale(12), marginTop: r.scale(16) }]}>
            Room name
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
            placeholder="Room name"
            placeholderTextColor="rgba(255,255,255,0.45)"
            autoFocus
            selectTextOnFocus
            maxLength={48}
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />

          <Text style={[styles.fieldLabel, { fontSize: r.scale(12), marginTop: r.scale(18) }]}>
            Page position
          </Text>
          <View
            style={[
              styles.positionRow,
              {
                marginTop: r.scale(8),
                borderRadius: r.scale(12),
                paddingVertical: r.scale(10),
                paddingHorizontal: r.scale(12),
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.positionButton,
                { width: r.scale(40), height: r.scale(40), borderRadius: r.scale(20) },
                draftPosition <= 1 && styles.positionButtonDisabled,
              ]}
              activeOpacity={0.7}
              onPress={moveUp}
              disabled={draftPosition <= 1}
              accessibilityRole="button"
              accessibilityLabel="Move room up"
            >
              <Ionicons name="chevron-up" size={r.scale(22)} color="#fff" />
            </TouchableOpacity>

            <Text style={[styles.positionText, { fontSize: r.scale(15) }]}>
              {draftPosition} / {totalRooms}
            </Text>

            <TouchableOpacity
              style={[
                styles.positionButton,
                { width: r.scale(40), height: r.scale(40), borderRadius: r.scale(20) },
                draftPosition >= totalRooms && styles.positionButtonDisabled,
              ]}
              activeOpacity={0.7}
              onPress={moveDown}
              disabled={draftPosition >= totalRooms}
              accessibilityRole="button"
              accessibilityLabel="Move room down"
            >
              <Ionicons name="chevron-down" size={r.scale(22)} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={[styles.fieldLabel, { fontSize: r.scale(12), marginTop: r.scale(18) }]}>
            Color
          </Text>
          <View
            style={[
              styles.colorRow,
              {
                marginTop: r.scale(8),
                gap: r.scale(10),
              },
            ]}
          >
            {ROOM_COLORS.map((color) => {
              const selected = draftColorId === color.id;
              return (
                <TouchableOpacity
                  key={color.id}
                  style={[
                    styles.colorSwatch,
                    {
                      width: r.scale(40),
                      height: r.scale(40),
                      borderRadius: r.scale(20),
                      backgroundColor: color.swatch,
                    },
                    selected && styles.colorSwatchSelected,
                  ]}
                  activeOpacity={0.75}
                  onPress={() => setDraftColorId(color.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${color.label} color`}
                  accessibilityState={{ selected }}
                >
                  {selected ? (
                    <Ionicons name="checkmark" size={r.scale(18)} color="#fff" />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>

          {mode === 'edit' && draftMachines.length > 1 ? (
            <>
              <Text style={[styles.fieldLabel, { fontSize: r.scale(12), marginTop: r.scale(18) }]}>
                Machines
              </Text>
              <View
                style={[
                  styles.machineOrderGroup,
                  {
                    marginTop: r.scale(8),
                    borderRadius: r.scale(12),
                  },
                ]}
              >
                {draftMachines.map((machine, index) => (
                  <View key={machine.id}>
                    {index > 0 ? <View style={styles.machineOrderDivider} /> : null}
                    <View
                      style={[
                        styles.machineOrderRow,
                        {
                          paddingVertical: r.scale(7),
                          paddingHorizontal: r.scale(12),
                        },
                      ]}
                    >
                      <Text style={[styles.machineOrderIndex, { fontSize: r.scale(12) }]}>
                        {index + 1}.
                      </Text>
                      <Text
                        style={[styles.machineOrderName, { fontSize: r.scale(13) }]}
                        numberOfLines={1}
                      >
                        {machine.name}
                      </Text>
                      <View style={styles.machineOrderControls}>
                        <TouchableOpacity
                          style={styles.orderIconButton}
                          activeOpacity={0.6}
                          onPress={() => moveMachineUp(index)}
                          disabled={index === 0}
                          hitSlop={6}
                          accessibilityRole="button"
                          accessibilityLabel={`Move ${machine.name} up`}
                        >
                          <Ionicons
                            name="chevron-up"
                            size={r.scale(16)}
                            color={index === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.55)'}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.orderIconButton}
                          activeOpacity={0.6}
                          onPress={() => moveMachineDown(index)}
                          disabled={index === draftMachines.length - 1}
                          hitSlop={6}
                          accessibilityRole="button"
                          accessibilityLabel={`Move ${machine.name} down`}
                        >
                          <Ionicons
                            name="chevron-down"
                            size={r.scale(16)}
                            color={
                              index === draftMachines.length - 1
                                ? 'rgba(255,255,255,0.2)'
                                : 'rgba(255,255,255,0.55)'
                            }
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </>
          ) : null}
          </ScrollView>

          <View style={[styles.actions, { marginTop: r.scale(18), gap: r.scale(10) }]}>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSecondary, { borderRadius: r.scale(12) }]}
              activeOpacity={0.7}
              onPress={onClose}
            >
              <Text style={[styles.actionText, { fontSize: r.scale(15) }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonPrimary, { borderRadius: r.scale(12) }]}
              activeOpacity={0.7}
              onPress={handleSave}
              disabled={!draftName.trim()}
            >
              <Text style={[styles.actionText, styles.actionTextPrimary, { fontSize: r.scale(15) }]}>
                {mode === 'add' ? 'Add' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          {canDelete ? (
            <TouchableOpacity
              style={[
                styles.deleteButton,
                {
                  marginTop: r.scale(12),
                  borderRadius: r.scale(12),
                  paddingVertical: r.scale(12),
                  gap: r.scale(8),
                },
              ]}
              activeOpacity={0.7}
              onPress={handleDeletePress}
              accessibilityRole="button"
              accessibilityLabel={`Delete ${draftName.trim() || roomName}`}
            >
              <Ionicons name="trash-outline" size={r.scale(18)} color="#FCA5A5" />
              <Text style={[styles.deleteText, { fontSize: r.scale(15) }]}>Delete room</Text>
            </TouchableOpacity>
          ) : null}
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
  confirmTitle: {
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  confirmIconWrap: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(248,113,113,0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(248,113,113,0.28)',
  },
  confirmMessage: {
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  confirmMessageMuted: {
    color: 'rgba(255,255,255,0.58)',
    fontWeight: '500',
  },
  confirmMessageStrong: {
    color: '#fff',
    fontWeight: '700',
  },
  moveInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(96,165,250,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(96,165,250,0.22)',
  },
  moveInfoIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(96,165,250,0.14)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(96,165,250,0.25)',
  },
  moveInfoContent: {
    flex: 1,
  },
  moveInfoTitle: {
    color: '#fff',
    fontWeight: '600',
  },
  moveInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  moveInfoDetail: {
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
  moveInfoBadge: {
    backgroundColor: 'rgba(96,165,250,0.18)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(96,165,250,0.35)',
  },
  moveInfoBadgeText: {
    color: '#93C5FD',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  confirmFootnote: {
    color: 'rgba(255,255,255,0.38)',
    fontWeight: '500',
    textAlign: 'center',
  },
  title: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  fieldLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  input: {
    color: '#fff',
    fontWeight: '600',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  positionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  positionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  positionButtonDisabled: {
    opacity: 0.35,
  },
  positionText: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  colorSwatch: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  colorSwatchSelected: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  machineOrderGroup: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  machineOrderDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 12,
  },
  machineOrderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  machineOrderIndex: {
    width: 18,
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '600',
  },
  machineOrderName: {
    flex: 1,
    color: 'rgba(255,255,255,0.82)',
    fontWeight: '500',
    minWidth: 0,
  },
  machineOrderControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderIconButton: {
    paddingHorizontal: 2,
    paddingVertical: 2,
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
  actionButtonDanger: {
    borderColor: 'rgba(248,113,113,0.45)',
    backgroundColor: 'rgba(248,113,113,0.16)',
  },
  actionText: {
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  actionTextPrimary: {
    color: '#fff',
    fontWeight: '700',
  },
  actionTextDanger: {
    color: '#FCA5A5',
    fontWeight: '700',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(248,113,113,0.45)',
    backgroundColor: 'rgba(248,113,113,0.12)',
  },
  deleteText: {
    color: '#FCA5A5',
    fontWeight: '700',
  },
});
