import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useResponsive } from '../utils/responsive';

type Props = {
  visible: boolean;
  roomName: string;
  position: number;
  totalRooms: number;
  onClose: () => void;
  onSave: (name: string, position: number) => void;
};

export default function RoomEditModal({
  visible,
  roomName,
  position,
  totalRooms,
  onClose,
  onSave,
}: Props) {
  const r = useResponsive();
  const [draftName, setDraftName] = useState(roomName);
  const [draftPosition, setDraftPosition] = useState(position);

  useEffect(() => {
    if (visible) {
      setDraftName(roomName);
      setDraftPosition(position);
    }
  }, [visible, roomName, position]);

  const moveUp = () => {
    setDraftPosition((current) => Math.max(1, current - 1));
  };

  const moveDown = () => {
    setDraftPosition((current) => Math.min(totalRooms, current + 1));
  };

  const handleSave = () => {
    const trimmed = draftName.trim();
    if (!trimmed) {
      return;
    }
    onSave(trimmed, draftPosition);
  };

  if (!visible) {
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
          <View style={styles.header}>
            <Text style={[styles.title, { fontSize: r.scale(18) }]}>Edit room</Text>
            <Pressable
              style={[
                styles.closeButton,
                { width: r.scale(32), height: r.scale(32), borderRadius: r.scale(16) },
              ]}
              onPress={onClose}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Close edit room dialog"
            >
              <Ionicons name="close" size={r.scale(18)} color="#fff" />
            </Pressable>
          </View>

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
                Save
              </Text>
            </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
