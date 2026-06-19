import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '../contexts/NavigationContext';
import { useResponsive } from '../utils/responsive';

export default function SettingsScreen() {
  const { navigate } = useNavigation();
  const r = useResponsive();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { paddingHorizontal: r.horizontalPadding }]}>
        <View style={[styles.headerActionWrap, { left: r.horizontalPadding }]}>
          <TouchableOpacity
            style={[
              styles.backButton,
              { width: r.scale(36), height: r.scale(36), borderRadius: r.scale(18) },
            ]}
            activeOpacity={0.7}
            onPress={() => navigate('account')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Back to profile"
          >
            <Ionicons name="chevron-back" size={r.scale(24)} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={[styles.headerTitle, { fontSize: r.scale(22) }]}>Settings</Text>
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
      />
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
  headerActionWrap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerTitle: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
