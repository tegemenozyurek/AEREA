import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MachineCard from '../components/MachineCard';
import { MOCK_MACHINES } from '../data/mockMachines';
import { useResponsive } from '../utils/responsive';

const COLLAPSE_MS = 220;

export default function MachinesScreen() {
  const r = useResponsive();
  const [roomExpanded, setRoomExpanded] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [cardsHeight, setCardsHeight] = useState(0);
  const expandAnim = useRef(new Animated.Value(1)).current;

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
          },
        ]}
        showsVerticalScrollIndicator={false}
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
            constrainHeight &&
              cardsHeight > 0 && {
                maxHeight: cardsMaxHeight,
                overflow: 'hidden',
              },
            isAnimating && {
              opacity: cardsOpacity,
              transform: [{ scaleY: cardsScale }],
            },
            !roomExpanded &&
              !isAnimating && {
                height: 0,
                overflow: 'hidden',
                opacity: 0,
              },
          ]}
        >
          <View
            style={[
              styles.cards,
              {
                marginTop: r.scale(20),
                marginLeft: r.cardInsetLeft,
                marginRight: r.cardInsetRight,
                gap: r.cardGap,
              },
            ]}
            onLayout={(e) => {
              const height = Math.ceil(e.nativeEvent.layout.height);
              if (height > 0 && height !== cardsHeight) {
                setCardsHeight(height);
              }
            }}
          >
            {MOCK_MACHINES.map((machine) => (
              <MachineCard key={machine.id} machine={machine} />
            ))}
          </View>
        </Animated.View>
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
    paddingBottom: 16,
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
  cards: {},
});
