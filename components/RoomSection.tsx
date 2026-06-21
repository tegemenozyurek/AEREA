import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MachineCard from './MachineCard';
import RoomPanel from './RoomPanel';
import type { Machine } from '../types/machine';
import type { Room } from '../types/room';
import { useResponsive } from '../utils/responsive';

const COLLAPSE_MS = 220;

type Props = {
  room: Room;
  defaultExpanded?: boolean;
  onMachinePress?: (machine: Machine, roomId: string, roomName: string) => void;
  onEditPress?: (room: Room) => void;
  onRefreshRoom?: (roomId: string) => Promise<void>;
  refreshingRoom?: boolean;
};

export default function RoomSection({
  room,
  defaultExpanded = false,
  onMachinePress,
  onEditPress,
  onRefreshRoom,
  refreshingRoom = false,
}: Props) {
  const r = useResponsive();
  const [machines, setMachines] = useState<Machine[]>(room.machines);
  const [roomExpanded, setRoomExpanded] = useState(defaultExpanded);
  const [isAnimating, setIsAnimating] = useState(false);
  const [cardsHeight, setCardsHeight] = useState(0);
  const expandAnim = useRef(new Animated.Value(defaultExpanded ? 1 : 0)).current;

  useEffect(() => {
    setMachines(room.machines);
  }, [room.machines]);

  const showMachines = roomExpanded || isAnimating;

  const toggleRoom = () => {
    const next = !roomExpanded;
    setIsAnimating(true);
    setRoomExpanded(next);

    Animated.timing(expandAnim, {
      toValue: next ? 1 : 0,
      duration: COLLAPSE_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        setIsAnimating(false);
      }
    });
  };

  const cardsMaxHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, cardsHeight],
  });

  const cardsOpacity = expandAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0.6, 1],
  });

  const cardsScale = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1],
  });

  const constrainHeight = isAnimating || !roomExpanded;

  const handleCardsLayout = useCallback(
    (height: number) => {
      const nextHeight = Math.ceil(height);
      if (nextHeight > 0 && nextHeight !== cardsHeight) {
        setCardsHeight(nextHeight);
      }
    },
    [cardsHeight],
  );

  return (
    <View
      style={{
        marginBottom: roomExpanded ? r.scale(20) : r.scale(14),
      }}
    >
      <RoomPanel
        roomName={room.name}
        machineCount={machines.length}
        environment={room.environment}
        colorId={room.colorId}
        expanded={roomExpanded}
        showContent={showMachines}
        refreshing={refreshingRoom}
        scale={r.scale}
        onToggle={toggleRoom}
        onEdit={() => onEditPress?.(room)}
        onRefresh={onRefreshRoom ? () => void onRefreshRoom(room.id) : undefined}
      >
        <Animated.View
          style={[
            constrainHeight &&
              cardsHeight > 0 && {
                maxHeight: cardsMaxHeight,
                overflow: 'hidden',
              },
            isAnimating && {
              opacity: cardsOpacity,
              transform: [{ scaleY: cardsScale }],
            },
            !showMachines && {
              height: 0,
              overflow: 'hidden',
              opacity: 0,
            },
          ]}
        >
          {showMachines ? (
            machines.length === 0 ? (
              <Text style={[styles.emptyMachines, { fontSize: r.scale(13), paddingVertical: r.scale(8) }]}>
                No machines in this room
              </Text>
            ) : (
              <View
                onLayout={(event) => {
                  handleCardsLayout(event.nativeEvent.layout.height);
                }}
              >
                {machines.map((item, index) => (
                  <View key={item.id}>
                    {index > 0 ? <View style={{ height: r.cardGap }} /> : null}
                    <View style={styles.machineRow}>
                      <View style={styles.machineCardCol}>
                        <MachineCard machine={item} />
                      </View>
                      <TouchableOpacity
                        style={[styles.machineChevronCol, { width: r.scale(28), paddingRight: r.scale(2) }]}
                        activeOpacity={0.7}
                        onPress={() => onMachinePress?.(item, room.id, room.name)}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel={`Open ${item.name}`}
                      >
                        <Ionicons
                          name="chevron-forward"
                          size={r.scale(22)}
                          color="rgba(255,255,255,0.55)"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )
          ) : null}
        </Animated.View>
      </RoomPanel>
    </View>
  );
}

const styles = StyleSheet.create({
  machineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  machineCardCol: {
    flex: 1,
  },
  machineChevronCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  emptyMachines: {
    color: 'rgba(255,255,255,0.42)',
    fontWeight: '500',
    textAlign: 'center',
  },
});
