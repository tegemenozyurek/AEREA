import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import GradientBackground from './components/GradientBackground';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import { pingFirebaseAuth } from './services/firebasePing';
import { useResponsive } from './utils/responsive';

const SPLASH_DURATION_MS = 1500;
const FADE_DURATION_MS = 350;
const SHOW_SPLASH = Platform.OS !== 'web';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Routes() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <HomeScreen /> : <AuthScreen />;
}

export default function App() {
  const [showSplash, setShowSplash] = useState(SHOW_SPLASH);
  const splashOpacity = useRef(new Animated.Value(SHOW_SPLASH ? 1 : 0)).current;
  const contentOpacity = useRef(new Animated.Value(SHOW_SPLASH ? 0 : 1)).current;
  const r = useResponsive();

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});

    if (__DEV__) {
      pingFirebaseAuth().then((result) => {
        if (result.ok) {
          console.log('[Firebase Ping] OK —', result.message);
        } else {
          console.warn('[Firebase Ping] FAILED —', result.message);
        }
      });
    }

    if (!SHOW_SPLASH) {
      return;
    }

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(splashOpacity, {
          toValue: 0,
          duration: FADE_DURATION_MS,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: FADE_DURATION_MS,
          useNativeDriver: true,
        }),
      ]).start(() => setShowSplash(false));
    }, SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, [contentOpacity, splashOpacity]);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <GradientBackground>
          <Animated.View style={[styles.fill, { opacity: contentOpacity }]}>
            <Routes />
          </Animated.View>

          {showSplash && (
            <Animated.View
              style={[StyleSheet.absoluteFill, { opacity: splashOpacity }]}
              pointerEvents="none"
            >
              <View style={styles.splashContent}>
                <Image
                  source={require('./assets/aerea-logo.png')}
                  style={[styles.splashLogo, { maxWidth: r.splashLogoMaxWidth }]}
                  resizeMode="contain"
                />
              </View>
            </Animated.View>
          )}

          <StatusBar style="light" />
        </GradientBackground>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  splashContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: {
    width: '55%',
    height: undefined,
    aspectRatio: 1390 / 694,
  },
});
