import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import GradientBackground from './components/GradientBackground';
import NavBar from './components/NavBar';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useEmailVerificationLink } from './hooks/useEmailVerificationLink';
import { ChatProvider } from './contexts/ChatContext';
import { CommunityProvider } from './contexts/CommunityContext';
import { HomeNotificationsProvider } from './contexts/HomeNotificationsContext';
import { MachinesAlertsProvider } from './contexts/MachinesAlertsContext';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { SeedExchangeProvider } from './contexts/SeedExchangeContext';
import AccountScreen from './screens/AccountScreen';
import MarketScreen from './screens/MarketScreen';
import AuthScreen from './screens/AuthScreen';
import EmailVerificationScreen from './screens/EmailVerificationScreen';
import UsernameSetupScreen from './screens/UsernameSetupScreen';
import CommunityScreen from './screens/CommunityScreen';
import HomeScreen from './screens/HomeScreen';
import MachinesScreen from './screens/MachinesScreen';
import SettingsScreen from './screens/SettingsScreen';
import { useResponsive } from './utils/responsive';

const SPLASH_DURATION_MS = 1500;
const FADE_DURATION_MS = 350;
const SHOW_SPLASH = Platform.OS !== 'web';

SplashScreen.preventAutoHideAsync().catch(() => {});

function CurrentScreen() {
  const { route } = useNavigation();
  switch (route) {
    case 'community':
      return <CommunityScreen />;
    case 'machines':
      return <MachinesScreen />;
    case 'market':
      return <MarketScreen />;
    case 'account':
      return <AccountScreen />;
    case 'settings':
      return <SettingsScreen />;
    case 'home':
    default:
      return <HomeScreen />;
  }
}

function AuthenticatedRoutes() {
  return (
    <View style={styles.fill}>
      <View style={styles.fill}>
        <CurrentScreen />
      </View>
      <NavBar />
    </View>
  );
}

function Routes() {
  const {
    authReady,
    isAuthenticated,
    pendingVerification,
    userDocReady,
    needsUsernameSetup,
    refreshEmailVerification,
  } = useAuth();
  const [linkMessage, setLinkMessage] = useState<string | null>(null);

  useEmailVerificationLink({
    onVerified: () => {
      void refreshEmailVerification();
    },
    onError: (message) => {
      setLinkMessage(message);
    },
  });

  if (!authReady) {
    return null;
  }

  if (pendingVerification) {
    return <EmailVerificationScreen />;
  }

  if (isAuthenticated && !userDocReady) {
    return null;
  }

  if (isAuthenticated && needsUsernameSetup) {
    return <UsernameSetupScreen />;
  }

  return isAuthenticated ? (
    <AuthenticatedRoutes />
  ) : (
    <AuthScreen linkMessage={linkMessage} onClearLinkMessage={() => setLinkMessage(null)} />
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(SHOW_SPLASH);
  const splashOpacity = useRef(new Animated.Value(SHOW_SPLASH ? 1 : 0)).current;
  const contentOpacity = useRef(new Animated.Value(SHOW_SPLASH ? 0 : 1)).current;
  const r = useResponsive();

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});

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
    <GestureHandlerRootView style={styles.fill}>
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationProvider>
        <ProfileProvider>
        <CommunityProvider>
        <SeedExchangeProvider>
        <ChatProvider>
        <HomeNotificationsProvider>
        <MachinesAlertsProvider>
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
        </MachinesAlertsProvider>
        </HomeNotificationsProvider>
        </ChatProvider>
        </SeedExchangeProvider>
        </CommunityProvider>
        </ProfileProvider>
        </NavigationProvider>
      </AuthProvider>
    </SafeAreaProvider>
    </GestureHandlerRootView>
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
