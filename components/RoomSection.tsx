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
import {
  NestableDraggableFlatList,
  RenderItemParams,
  ShadowDecorator,
} from 'react-native-draggable-flatlist';
import MachineCard from './MachineCard';
import RoomPanel from './RoomPanel';
import type { Machine } from '../types/machine';
import type { Room } from '../types/room';
import { useResponsive } from '../utils/responsive';

const COLLAPSE_MS = 220;
const DRAG_HOLD_MS = 2000;

const DRAG_SPRING = {
  damping: 22,
  stiffness: 180,
  mass: 0.18,
  overshootClamping: true,
};

type Props = {
  room: Room;
  defaultExpanded?: boolean;
  onMachinesChange: (roomId: string, machines: Machine[]) => void;
  onMachinePress?: (machine: Machine, roomId: string, roomName: string) => void;
  onEditPress?: (room: Room) => void;
  onRefreshRoom?: (roomId: string) => Promise<void>;
  refreshingRoom?: boolean;
};

export default function RoomSection({
  room,
  defaultExpanded = false,
  onMachinesChange,
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
  const isDraggingRef = useRef(false);
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

  const renderMachine = useCallback(
    ({ item, drag, isActive }: RenderItemParams<Machine>) => (
      <View style={styles.machineRow}>
        <View style={styles.machineCardCol}>
          <ShadowDecorator elevation={12} radius={10} opacity={0.3}>
            <MachineCard
              machine={item}
              onLongPressDrag={drag}
              isDragging={isActive}
              dragHoldMs={DRAG_HOLD_MS}
            />
          </ShadowDecorator>
        </View>
        <TouchableOpacity
          style={[styles.machineChevronCol, { width: r.scale(28), paddingRight: r.scale(2) }]}
          activeOpacity={0.7}
          onPress={() => onMachinePress?.(item, room.id, room.name)}
          hitSlop={8}
          disabled={isActive}
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
    ),
    [onMachinePress, room.id, room.name, r],
  );

  const handleDragBegin = useCallback(() => {
    isDraggingRef.current = true;
  }, []);

  const handleDragEnd = useCallback(
    ({ data }: { data: Machine[] }) => {
      isDraggingRef.current = false;
      setMachines(data);
      onMachinesChange(room.id, data);
    },
    [onMachinesChange, room.id],
  );

  const handleListContentSizeChange = useCallback(
    (_w: number, h: number) => {
      if (isDraggingRef.current) {
        return;
      }
      const height = Math.ceil(h);
      if (height > 0 && height !== cardsHeight) {
        setCardsHeight(height);
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
            <NestableDraggableFlatList
              data={machines}
              keyExtractor={(item) => item.id}
              renderItem={renderMachine}
              onDragBegin={handleDragBegin}
              onDragEnd={handleDragEnd}
              onContentSizeChange={handleListContentSizeChange}
              activationDistance={20}
              dragItemOverflow
              animationConfig={DRAG_SPRING}
              ItemSeparatorComponent={() => <View style={{ height: r.cardGap }} />}
              ListEmptyComponent={
                <Text style={[styles.emptyMachines, { fontSize: r.scale(13), paddingVertical: r.scale(8) }]}>
                  No machines in this room
                </Text>
              }
            />
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
