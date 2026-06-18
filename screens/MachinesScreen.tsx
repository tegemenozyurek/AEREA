import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
  ShadowDecorator,
} from 'react-native-draggable-flatlist';
import { SafeAreaView } from 'react-native-safe-area-context';
import MachineCard from '../components/MachineCard';
import { MOCK_MACHINES } from '../data/mockMachines';
import type { Machine } from '../types/machine';
import { useResponsive } from '../utils/responsive';

const COLLAPSE_MS = 220;

const DRAG_HOLD_MS = 2000;

const DRAG_SPRING = {
  damping: 22,
  stiffness: 180,
  mass: 0.18,
  overshootClamping: true,
};

export default function MachinesScreen() {
  const r = useResponsive();
  const [machines, setMachines] = useState<Machine[]>(MOCK_MACHINES);
  const [roomExpanded, setRoomExpanded] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [cardsHeight, setCardsHeight] = useState(0);
  const isDraggingRef = useRef(false);
  const expandAnim = useRef(new Animated.Value(1)).current;

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

  const arrowRotate = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '0deg'],
  });

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
      <ShadowDecorator elevation={12} radius={10} opacity={0.3}>
        <MachineCard
          machine={item}
          onLongPressDrag={drag}
          isDragging={isActive}
          dragHoldMs={DRAG_HOLD_MS}
        />
      </ShadowDecorator>
    ),
    [],
  );

  const handleDragBegin = useCallback(() => {
    isDraggingRef.current = true;
  }, []);

  const handleDragEnd = useCallback(({ data }: { data: Machine[] }) => {
    isDraggingRef.current = false;
    setMachines(data);
  }, []);

  const handleListContentSizeChange = useCallback((_w: number, h: number) => {
    if (isDraggingRef.current) {
      return;
    }
    const height = Math.ceil(h);
    if (height > 0 && height !== cardsHeight) {
      setCardsHeight(height);
    }
  }, [cardsHeight]);

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

      <View
        style={[
          styles.body,
          {
            paddingHorizontal: r.horizontalPadding,
            maxWidth: r.contentMaxWidth,
            alignSelf: 'center',
            width: '100%',
          },
        ]}
      >
        <View style={styles.roomHeader}>
          <Text style={[styles.roomTitle, { fontSize: r.scale(26) }]}>Room #1</Text>
          <TouchableOpacity
            style={[styles.roomToggle, { width: r.scale(32), height: r.scale(32) }]}
            activeOpacity={0.7}
            onPress={toggleRoom}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={roomExpanded ? 'Collapse room' : 'Expand room'}
          >
            <Animated.View style={{ transform: [{ rotate: arrowRotate }] }}>
              <Ionicons name="chevron-up" size={r.scale(22)} color="rgba(255,255,255,0.85)" />
            </Animated.View>
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[
            styles.listWrap,
            {
              marginTop: r.scale(20),
              marginLeft: r.cardInsetLeft,
              marginRight: r.cardInsetRight,
            },
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
          {showMachines && (
            <DraggableFlatList
              data={machines}
              keyExtractor={(item) => item.id}
              renderItem={renderMachine}
              onDragBegin={handleDragBegin}
              onDragEnd={handleDragEnd}
              onContentSizeChange={handleListContentSizeChange}
              scrollEnabled
              activationDistance={10}
              dragItemOverflow
              animationConfig={DRAG_SPRING}
              ItemSeparatorComponent={() => (
                <View style={{ height: r.cardGap }} />
              )}
            />
          )}
        </Animated.View>
      </View>
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
  body: {
    flex: 1,
    paddingTop: 8,
    paddingBottom: 16,
  },
  listWrap: {
    flex: 1,
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roomTitle: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.3,
    flex: 1,
    marginRight: 8,
  },
  roomToggle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
