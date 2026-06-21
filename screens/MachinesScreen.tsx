import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NestableScrollContainer } from 'react-native-draggable-flatlist';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddMachineModal from '../components/AddMachineModal';
import RoomEditModal from '../components/RoomEditModal';
import RoomSection from '../components/RoomSection';
import {
  createDefaultMachine,
  createDefaultRoom,
  DEFAULT_ROOM_ID,
  DEFAULT_ROOM_NAME,
  isDefaultRoom,
  MOCK_ROOMS,
  refreshRoomMetrics,
  refreshSingleRoom,
  type NearbyMachine,
} from '../data/mockMachines';
import type { RoomColorId } from '../constants/roomColors';
import type { Machine } from '../types/machine';
import type { PlantProfile } from '../types/plantProfile';
import { CUSTOM_PLANT_PROFILE_ID } from '../types/plantProfile';
import type { Room } from '../types/room';
import { useMachinesAlerts } from '../contexts/MachinesAlertsContext';
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
  const { syncRooms } = useMachinesAlerts();
  const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<SelectedMachine | null>(null);
  const [editingRoom, setEditingRoom] = useState<EditingRoom | null>(null);
  const [addMachineOpen, setAddMachineOpen] = useState(false);
  const [addRoomOpen, setAddRoomOpen] = useState(false);
  const [addRoomForMachineId, setAddRoomForMachineId] = useState<string | null>(null);
  const [refreshingRoomId, setRefreshingRoomId] = useState<string | null>(null);

  useEffect(() => {
    syncRooms(rooms);
  }, [rooms, syncRooms]);

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

  const handlePlantProfileChange = useCallback(
    (machineId: string, plantProfileId: string, customPlantProfile?: PlantProfile) => {
      const nextProfileId = plantProfileId || undefined;
      const nextCustomProfile =
        nextProfileId === CUSTOM_PLANT_PROFILE_ID ? customPlantProfile : undefined;

      setRooms((prev) =>
        prev.map((room) => ({
          ...room,
          machines: room.machines.map((machine) =>
            machine.id === machineId
              ? {
                  ...machine,
                  plantProfileId: nextProfileId,
                  customPlantProfile: nextCustomProfile,
                }
              : machine,
          ),
        })),
      );

      setSelectedMachine((current) =>
        current?.machine.id === machineId
          ? {
              ...current,
              machine: {
                ...current.machine,
                plantProfileId: nextProfileId,
                customPlantProfile: nextCustomProfile,
              },
            }
          : current,
      );
    },
    [],
  );

  const handleEditRoomPress = useCallback(
    (room: Room) => {
      const index = rooms.findIndex((item) => item.id === room.id);
      if (index !== -1) {
        setEditingRoom({ room, index });
      }
    },
    [rooms],
  );

  const handleAddRoom = useCallback((name: string, position: number, colorId: RoomColorId, moveMachineId?: string | null) => {
    const room = createDefaultRoom(name, colorId);

    setRooms((prev) => {
      const next = [...prev];
      const targetIndex = Math.max(0, Math.min(next.length, position - 1));
      next.splice(targetIndex, 0, room);

      if (!moveMachineId) {
        return next;
      }

      const fromRoom = next.find((item) => item.machines.some((m) => m.id === moveMachineId));
      const machine = fromRoom?.machines.find((m) => m.id === moveMachineId);
      if (!fromRoom || !machine) {
        return next;
      }

      return next.map((item) => {
        if (item.id === fromRoom.id) {
          return { ...item, machines: item.machines.filter((m) => m.id !== moveMachineId) };
        }
        if (item.id === room.id) {
          return { ...item, machines: [...item.machines, machine] };
        }
        return item;
      });
    });

    if (moveMachineId) {
      setSelectedMachine((current) =>
        current?.machine.id === moveMachineId
          ? { ...current, roomId: room.id, roomName: room.name }
          : current,
      );
    }

    setAddRoomForMachineId(null);
    setAddRoomOpen(false);
  }, []);

  const closeAddRoomModal = useCallback(() => {
    setAddRoomOpen(false);
    setAddRoomForMachineId(null);
  }, []);

  const openAddRoomModal = useCallback((moveMachineId?: string) => {
    setAddRoomForMachineId(moveMachineId ?? null);
    setAddRoomOpen(true);
  }, []);

  const handleAddMachine = useCallback(
    (name: string, roomId: string, device: NearbyMachine, plantProfileId: string) => {
      const machine = createDefaultMachine(roomId, name, {
        deviceId: device.id,
        model: device.model,
        plantProfileId,
      });
      const roomName = rooms.find((room) => room.id === roomId)?.name ?? DEFAULT_ROOM_NAME;

      setRooms((prev) =>
        prev.map((room) =>
          room.id === roomId ? { ...room, machines: [...room.machines, machine] } : room,
        ),
      );
      setAddMachineOpen(false);
      setSelectedMachine({ machine, roomId, roomName });
    },
    [rooms],
  );

  const handleDeleteRoom = useCallback((roomId: string) => {
    if (isDefaultRoom(roomId)) {
      return;
    }

    setRooms((prev) => {
      if (prev.length <= 1) {
        return prev;
      }

      const roomToDelete = prev.find((room) => room.id === roomId);
      const defaultRoom = prev.find((room) => room.id === DEFAULT_ROOM_ID);
      if (!roomToDelete || !defaultRoom) {
        return prev;
      }

      return prev
        .filter((room) => room.id !== roomId)
        .map((room) =>
          room.id === DEFAULT_ROOM_ID
            ? { ...room, machines: [...room.machines, ...roomToDelete.machines] }
            : room,
        );
    });

    setSelectedMachine((current) => {
      if (!current || current.roomId !== roomId) {
        return current;
      }

      return {
        ...current,
        roomId: DEFAULT_ROOM_ID,
        roomName: DEFAULT_ROOM_NAME,
      };
    });
    setEditingRoom(null);
  }, []);

  const handleSaveRoom = useCallback((
    roomId: string,
    name: string,
    position: number,
    colorId: RoomColorId,
    machines: Machine[],
  ) => {
    setRooms((prev) => {
      const currentIndex = prev.findIndex((room) => room.id === roomId);
      if (currentIndex === -1) {
        return prev;
      }

      const next = [...prev];
      const [room] = next.splice(currentIndex, 1);
      const updatedRoom = { ...room, name, colorId, machines };
      const targetIndex = Math.max(0, Math.min(next.length, position - 1));
      next.splice(targetIndex, 0, updatedRoom);
      return next;
    });

    setSelectedMachine((current) =>
      current?.roomId === roomId ? { ...current, roomName: name } : current,
    );
    setEditingRoom(null);
  }, []);

  const applyRoomMetricsRefresh = useCallback(() => {
    setRooms((prev) => {
      const next = refreshRoomMetrics(prev);
      setSelectedMachine((current) => {
        if (!current) {
          return current;
        }
        const room = next.find((item) => item.id === current.roomId);
        const updatedMachine = room?.machines.find((item) => item.id === current.machine.id);
        if (!room || !updatedMachine) {
          return current;
        }
        return { ...current, machine: updatedMachine, roomName: room.name };
      });
      return next;
    });
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    applyRoomMetricsRefresh();
    setRefreshing(false);
  }, [applyRoomMetricsRefresh]);

  const refreshMachineDetail = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    applyRoomMetricsRefresh();
  }, [applyRoomMetricsRefresh]);

  const handleRefreshRoom = useCallback(async (roomId: string) => {
    setRefreshingRoomId(roomId);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setRooms((prev) =>
      prev.map((room) => (room.id === roomId ? refreshSingleRoom(room) : room)),
    );
    setRefreshingRoomId(null);
  }, []);

  if (selectedMachine) {
    return (
      <>
        <MachineDetailScreen
          machine={selectedMachine.machine}
          roomId={selectedMachine.roomId}
          roomName={
            rooms.find((room) => room.id === selectedMachine.roomId)?.name ??
            selectedMachine.roomName
          }
          rooms={rooms}
          onRoomChange={(roomId) => handleMoveMachine(selectedMachine.machine.id, roomId)}
          onNameChange={(name) => handleRenameMachine(selectedMachine.machine.id, name)}
          onPlantProfileChange={(plantProfileId, customPlantProfile) =>
            handlePlantProfileChange(selectedMachine.machine.id, plantProfileId, customPlantProfile)
          }
          onAddRoom={() => openAddRoomModal(selectedMachine.machine.id)}
          onBack={() => setSelectedMachine(null)}
          onRefresh={refreshMachineDetail}
        />
        <RoomEditModal
          visible={addRoomOpen}
          mode="add"
          roomName={`Room #${rooms.length + 1}`}
          position={rooms.length + 1}
          totalRooms={rooms.length + 1}
          onClose={closeAddRoomModal}
          onSave={(name, position, colorId, _machines) =>
            handleAddRoom(name, position, colorId, addRoomForMachineId)
          }
        />
      </>
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
          roomColorId={editingRoom.room.colorId}
          machines={editingRoom.room.machines}
          machineCount={editingRoom.room.machines.length}
          onClose={() => setEditingRoom(null)}
          onSave={(name, position, colorId, machines) =>
            handleSaveRoom(editingRoom.room.id, name, position, colorId, machines)
          }
          onDelete={
            isDefaultRoom(editingRoom.room.id)
              ? undefined
              : () => handleDeleteRoom(editingRoom.room.id)
          }
        />
      ) : null}
      <AddMachineModal
        visible={addMachineOpen}
        rooms={rooms}
        onClose={() => setAddMachineOpen(false)}
        onSave={handleAddMachine}
      />
      <RoomEditModal
        visible={addRoomOpen}
        mode="add"
        roomName={`Room #${rooms.length + 1}`}
        position={rooms.length + 1}
        totalRooms={rooms.length + 1}
        onClose={closeAddRoomModal}
        onSave={(name, position, colorId, _machines) =>
          handleAddRoom(name, position, colorId, addRoomForMachineId)
        }
      />
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
            onPress={() => setAddMachineOpen(true)}
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void refresh()}
            tintColor="#fff"
            colors={['#008D41']}
          />
        }
      >
        {rooms.map((room) => (
          <RoomSection
            key={room.id}
            room={room}
            onMachinePress={handleMachinePress}
            onEditPress={handleEditRoomPress}
            onRefreshRoom={handleRefreshRoom}
            refreshingRoom={refreshingRoomId === room.id}
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
            onPress={() => openAddRoomModal()}
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
