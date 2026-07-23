import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlassCard from '../components/GlassCard';
import { useResponsive } from '../utils/responsive';

export default function MarketScreen() {
  const r = useResponsive();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { paddingHorizontal: r.horizontalPadding }]}>
        <Text style={[styles.headerTitle, { fontSize: r.scale(22) }]}>Market</Text>
      </View>

      <View style={[styles.body, { paddingHorizontal: r.horizontalPadding }]}>
        <GlassCard style={[styles.card, { padding: r.scale(28), gap: r.scale(14) }]}>
          <View
            style={[
              styles.iconCircle,
              {
                width: r.scale(72),
                height: r.scale(72),
                borderRadius: r.scale(36),
              },
            ]}
          >
            <Ionicons name="lock-closed" size={r.scale(30)} color="rgba(255,255,255,0.7)" />
          </View>
          <Text style={[styles.comingSoonTitle, { fontSize: r.scale(24) }]}>Yakında</Text>
          <Text style={[styles.comingSoonText, { fontSize: r.scale(14), lineHeight: r.scale(21) }]}>
            Market bölümü üzerinde çalışıyoruz. Ekipman, besin ve aksesuarlar yakında burada olacak.
          </Text>
        </GlassCard>
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
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 24,
  },
  card: {
    alignItems: 'center',
  },
  iconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  comingSoonTitle: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  comingSoonText: {
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
    textAlign: 'center',
  },
});
