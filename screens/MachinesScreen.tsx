import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NestableScrollContainer } from 'react-native-draggable-flatlist';
import { SafeAreaView } from 'react-native-safe-area-context';
import RoomEditModal from '../components/RoomEditModal';
import RoomSection from '../components/RoomSection';
import { MOCK_ROOMS } from '../data/mockMachines';
import type { Machine } from '../types/machine';
import type { Room } from '../types/room';
import { useResponsive } from '../utils/responsive';
import MachineDetailScreen from './MachineDetailScreen';

type SelectedMachine = {
  machine: Machine;
  roomId: string;
  roomName: string;
};

type EditingRoom = {
  room: Room;
  index: number;
};

export default function MachinesScreen() {
  const r = useResponsive();
  const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS);
  const [selectedMachine, setSelectedMachine] = useState<SelectedMachine | null>(null);
  const [editingRoom, setEditingRoom] = useState<EditingRoom | null>(null);

  const handleMachinesChange = useCallback((roomId: string, machines: Machine[]) => {
    setRooms((prev) =>
      prev.map((room) => (room.id === roomId ? { ...room, machines } : room)),
    );
  }, []);

  const handleMachinePress = useCallback((machine: Machine, roomId: string, roomName: string) => {
    setSelectedMachine({ machine, roomId, roomName });
  }, []);

  const handleMoveMachine = useCallback((machineId: string, toRoomId: string) => {
    setRooms((prev) => {
      const fromRoom = prev.find((room) => room.machines.some((m) => m.id === machineId));
      if (!fromRoom || fromRoom.id === toRoomId) {
        return prev;
      }

      const machine = fromRoom.machines.find((m) => m.id === machineId);
      const toRoom = prev.find((room) => room.id === toRoomId);
      if (!machine || !toRoom) {
        return prev;
      }

      setSelectedMachine((current) =>
        current?.machine.id === machineId
          ? { machine, roomId: toRoomId, roomName: toRoom.name }
          : current,
      );

      return prev.map((room) => {
        if (room.id === fromRoom.id) {
          return { ...room, machines: room.machines.filter((m) => m.id !== machineId) };
        }
        if (room.id === toRoomId) {
          return { ...room, machines: [...room.machines, machine] };
        }
        return room;
      });
    });
  }, []);

  const handleRenameMachine = useCallback((machineId: string, name: string) => {
    setRooms((prev) =>
      prev.map((room) => ({
        ...room,
        machines: room.machines.map((machine) =>
          machine.id === machineId ? { ...machine, name } : machine,
        ),
      })),
    );
    setSelectedMachine((current) =>
      current?.machine.id === machineId
        ? { ...current, machine: { ...current.machine, name } }
        : current,
    );
  }, []);

  const handleEditRoomPress = useCallback(
    (room: Room) => {
      const index = rooms.findIndex((item) => item.id === room.id);
      if (index !== -1) {
        setEditingRoom({ room, index });
      }
    },
    [rooms],
  );

  const handleSaveRoom = useCallback((roomId: string, name: string, position: number) => {
    setRooms((prev) => {
      const currentIndex = prev.findIndex((room) => room.id === roomId);
      if (currentIndex === -1) {
        return prev;
      }

      const next = [...prev];
      const [room] = next.splice(currentIndex, 1);
      const updatedRoom = { ...room, name };
      const targetIndex = Math.max(0, Math.min(next.length, position - 1));
      next.splice(targetIndex, 0, updatedRoom);
      return next;
    });

    setSelectedMachine((current) =>
      current?.roomId === roomId ? { ...current, roomName: name } : current,
    );
    setEditingRoom(null);
  }, []);

  if (selectedMachine) {
    return (
      <MachineDetailScreen
        machine={selectedMachine.machine}
        roomId={selectedMachine.roomId}
        roomName={selectedMachine.roomName}
        rooms={rooms}
        onRoomChange={(roomId) => handleMoveMachine(selectedMachine.machine.id, roomId)}
        onNameChange={(name) => handleRenameMachine(selectedMachine.machine.id, name)}
        onBack={() => setSelectedMachine(null)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {editingRoom ? (
        <RoomEditModal
          visible
          roomName={editingRoom.room.name}
          position={editingRoom.index + 1}
          totalRooms={rooms.length}
          onClose={() => setEditingRoom(null)}
          onSave={(name, position) => handleSaveRoom(editingRoom.room.id, name, position)}
        />
      ) : null}
      <View style={[styles.header, { paddingHorizontal: r.horizontalPadding }]}>
        <Text style={[styles.headerTitle, { fontSize: r.scale(22) }]}>Machines</Text>
        <View style={[styles.headerActionWrap, { right: r.horizontalPadding }]}>
          <TouchableOpacity
            style={[
              styles.addButton,
              {
                width: r.scale(36),
                height: r.scale(36),
                borderRadius: r.scale(18),
              },
            ]}
            activeOpacity={0.7}
            onPress={() => {}}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Add machine"
          >
            <Ionicons name="add" size={r.scale(24)} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <NestableScrollContainer
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: r.horizontalPadding,
            maxWidth: r.contentMaxWidth,
            alignSelf: 'center',
            width: '100%',
            paddingBottom: r.scale(120),
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {rooms.map((room) => (
          <RoomSection
            key={room.id}
            room={room}
            onMachinesChange={handleMachinesChange}
            onMachinePress={handleMachinePress}
            onEditPress={handleEditRoomPress}
          />
        ))}

        <View style={[styles.addRoomWrap, { marginTop: r.scale(8) }]}>
          <TouchableOpacity
            style={[
              styles.addRoomButton,
              {
                paddingVertical: r.scale(12),
                paddingHorizontal: r.scale(20),
                borderRadius: r.scale(22),
                gap: r.scale(8),
              },
            ]}
            activeOpacity={0.7}
            onPress={() => {}}
            accessibilityRole="button"
            accessibilityLabel="Add room"
          >
            <Ionicons name="add" size={r.scale(20)} color="#fff" />
            <Text style={[styles.addRoomLabel, { fontSize: r.scale(15) }]}>Add Room</Text>
          </TouchableOpacity>
        </View>
      </NestableScrollContainer>
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
  headerTitle: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  headerActionWrap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  addRoomWrap: {
    alignItems: 'center',
  },
  addRoomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  addRoomLabel: {
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
