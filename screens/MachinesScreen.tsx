import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RoomSection from '../components/RoomSection';
import { MOCK_ROOMS } from '../data/mockMachines';
import type { Machine } from '../types/machine';
import type { Room } from '../types/room';
import { useResponsive } from '../utils/responsive';

export default function MachinesScreen() {
  const r = useResponsive();
  const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const handleMachinesChange = useCallback((roomId: string, machines: Machine[]) => {
    setRooms((prev) =>
      prev.map((room) => (room.id === roomId ? { ...room, machines } : room)),
    );
  }, []);

  const handleDragActiveChange = useCallback((active: boolean) => {
    setScrollEnabled(!active);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
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

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: r.horizontalPadding,
            maxWidth: r.contentMaxWidth,
            alignSelf: 'center',
            width: '100%',
            paddingBottom: r.scale(24),
          },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
      >
        {rooms.map((room) => (
          <RoomSection
            key={room.id}
            room={room}
            onMachinesChange={handleMachinesChange}
            onDragActiveChange={handleDragActiveChange}
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
    flexGrow: 1,
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
