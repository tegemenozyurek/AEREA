import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SettingsProfileCard from '../components/SettingsProfileCard';
import SettingsRow from '../components/SettingsRow';
import SettingsSection from '../components/SettingsSection';
import { MOCK_OWN_BIO } from '../data/mockUsers';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../contexts/NavigationContext';
import { getProfileUsername } from '../utils/profile';
import { useResponsive } from '../utils/responsive';

const APP_VERSION = '1.0.0';

type ThemeOption = 'dark' | 'light';
type LanguageOption = 'English' | 'Türkçe' | 'Deutsch';

const THEME_LABELS: Record<ThemeOption, string> = {
  dark: 'Dark',
  light: 'Light',
};

const SWITCH_TRACK = {
  false: 'rgba(255,255,255,0.14)',
  true: 'rgba(96,165,250,0.45)',
};

function comingSoon(feature: string) {
  Alert.alert(feature, 'Coming soon.');
}

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { navigate } = useNavigation();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [theme, setTheme] = useState<ThemeOption>('dark');
  const [language, setLanguage] = useState<LanguageOption>('English');

  const username = getProfileUsername(user?.email, user?.displayName);

  const pickTheme = () => {
    Alert.alert('Theme', undefined, [
      { text: 'Dark', onPress: () => setTheme('dark') },
      { text: 'Light', onPress: () => setTheme('light') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const pickLanguage = () => {
    Alert.alert('Language', undefined, [
      { text: 'English', onPress: () => setLanguage('English') },
      { text: 'Türkçe', onPress: () => setLanguage('Türkçe') },
      { text: 'Deutsch', onPress: () => setLanguage('Deutsch') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          void logout();
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'This permanently deletes your account and all data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete account',
          style: 'destructive',
          onPress: () => comingSoon('Delete account'),
        },
      ],
    );
  };

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + r.scale(8),
            paddingHorizontal: r.horizontalPadding,
            paddingBottom: r.scale(12),
          },
        ]}
      >
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
        <Text style={[styles.headerTitle, { fontSize: r.scale(18) }]}>Settings</Text>
        <View style={{ width: r.scale(36) }} />
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
            paddingTop: r.scale(16),
            paddingBottom: r.scale(32),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSection title="Profile">
          <SettingsProfileCard
            username={username}
            bio={MOCK_OWN_BIO}
            photoUrl={user?.photoURL}
            onEditPress={() => comingSoon('Edit profile')}
          />
        </SettingsSection>

        <SettingsSection title="Account">
          <SettingsRow label="Mail" value={user?.email ?? '—'} stacked />
          <SettingsRow label="ID" value={user?.uid ?? '—'} stacked />
          <SettingsRow
            label="Change password"
            showChevron
            onPress={() => comingSoon('Change password')}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Settings">
          <SettingsRow
            label="Theme"
            value={THEME_LABELS[theme]}
            showChevron
            onPress={pickTheme}
          />
          <SettingsRow
            label="Language"
            value={language}
            showChevron
            onPress={pickLanguage}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Notifications">
          <SettingsRow
            label="Push notifications"
            rightElement={
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={SWITCH_TRACK}
                thumbColor="#fff"
                ios_backgroundColor={SWITCH_TRACK.false}
              />
            }
          />
          <SettingsRow
            label="Product updates"
            rightElement={
              <Switch
                value={emailUpdates}
                onValueChange={setEmailUpdates}
                trackColor={SWITCH_TRACK}
                thumbColor="#fff"
                ios_backgroundColor={SWITCH_TRACK.false}
              />
            }
            isLast
          />
        </SettingsSection>

        <SettingsSection title="About">
          <SettingsRow label="Help" showChevron onPress={() => comingSoon('Help')} />
          <SettingsRow label="Privacy" showChevron onPress={() => comingSoon('Privacy')} />
          <SettingsRow label="Terms" showChevron onPress={() => comingSoon('Terms')} isLast />
        </SettingsSection>

        <SettingsSection title="Security" separated>
          <SettingsRow
            label="Sign out"
            destructive
            centered
            onPress={handleSignOut}
            isLast
          />
          <SettingsRow
            label="Delete account"
            destructive
            centered
            onPress={handleDeleteAccount}
            isLast
          />
        </SettingsSection>

        <Text style={[styles.version, { fontSize: r.scale(12), marginTop: r.scale(4) }]}>
          AEREA · v{APP_VERSION}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
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
    letterSpacing: 0.3,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  version: {
    color: 'rgba(255,255,255,0.28)',
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
