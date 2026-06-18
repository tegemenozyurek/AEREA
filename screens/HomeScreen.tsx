import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useResponsive } from '../utils/responsive';

const LOGO_ASPECT_RATIO = 1390 / 694;

export default function HomeScreen() {
  const { user } = useAuth();
  const r = useResponsive();
  const greetingName =
    user?.email?.split('@')[0] ?? user?.displayName ?? 'there';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View
        style={[
          styles.header,
          {
            paddingHorizontal: r.horizontalPadding,
          },
        ]}
      >
        <Image
          source={require('../assets/aerea-logo.png')}
          style={[
            styles.headerLogo,
            { width: r.isTablet ? 110 : 90 },
          ]}
          resizeMode="contain"
        />
      </View>

      <View style={styles.body}>
        <Text style={styles.welcome}>Welcome, {greetingName}</Text>
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
    alignItems: 'center',
    paddingVertical: 12,
  },
  headerLogo: {
    height: undefined,
    aspectRatio: LOGO_ASPECT_RATIO,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcome: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
