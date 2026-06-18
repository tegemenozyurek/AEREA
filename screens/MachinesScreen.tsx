import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useResponsive } from '../utils/responsive';

const MACHINES: { id: number; name: string; online: boolean }[] = [
  { id: 1, name: 'Machine #1 - Tomato 🍅', online: true },
  { id: 2, name: 'Machine #2 - Strawberry 🍓', online: false },
  { id: 3, name: 'Machine #3 - Pepper 🌶️', online: true },
];

export default function MachinesScreen() {
  const r = useResponsive();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { paddingHorizontal: r.horizontalPadding }]}>
        <Text style={styles.headerTitle}>Machines</Text>
        <View style={[styles.headerActionWrap, { right: r.horizontalPadding }]}>
          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.7}
            onPress={() => {}}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Add machine"
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.body, { paddingHorizontal: r.horizontalPadding }]}>
        <Text style={styles.roomTitle}>Room #1</Text>

        <View style={styles.cards}>
          {MACHINES.map((m) => (
            <View key={m.id} style={styles.card}>
              <View style={styles.cardTopRow}>
                <Text style={styles.cardTitle}>{m.name}</Text>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: m.online ? '#34D399' : '#F87171' },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
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
    fontSize: 22,
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
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  body: {
    flex: 1,
    paddingTop: 8,
  },
  roomTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cards: {
    marginTop: 20,
    gap: 12,
  },
  card: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 20,
    minHeight: 120,
    position: 'relative',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  cardTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
