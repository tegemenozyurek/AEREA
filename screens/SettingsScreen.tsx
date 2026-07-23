import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ChangePasswordModal from '../components/ChangePasswordModal';
import EditProfileModal from '../components/EditProfileModal';
import SettingsChoiceRow from '../components/SettingsChoiceRow';
import SettingsProfileCard from '../components/SettingsProfileCard';
import SettingsRow from '../components/SettingsRow';
import SettingsSection from '../components/SettingsSection';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useProfile } from '../contexts/ProfileContext';
import { hasEmailPasswordProvider } from '../services/auth';
import { useResponsive } from '../utils/responsive';

const APP_VERSION = '1.0.0';

type ThemeOption = 'dark' | 'light';
type LanguageOption = 'English' | 'Türkçe' | 'Deutsch';
type ExpandedPicker = 'theme' | 'language' | null;

const THEME_OPTIONS = [
  { value: 'dark' as const, label: 'Dark', icon: 'moon-outline' as const },
  { value: 'light' as const, label: 'Light', icon: 'sunny-outline' as const },
];

const LANGUAGE_OPTIONS = [
  { value: 'English' as const, label: 'English', icon: 'globe-outline' as const },
  { value: 'Türkçe' as const, label: 'Türkçe', icon: 'globe-outline' as const },
  { value: 'Deutsch' as const, label: 'Deutsch', icon: 'globe-outline' as const },
];

const SWITCH_TRACK = {
  false: 'rgba(255,255,255,0.14)',
  true: 'rgba(96,165,250,0.45)',
};

function comingSoon(feature: string) {
  Alert.alert(feature, 'Coming soon.');
}

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { username, bio, photoUrl, updateProfile } = useProfile();
  const { navigate } = useNavigation();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [theme, setTheme] = useState<ThemeOption>('dark');
  const [language, setLanguage] = useState<LanguageOption>('English');
  const [expandedPicker, setExpandedPicker] = useState<ExpandedPicker>(null);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const togglePicker = (picker: Exclude<ExpandedPicker, null>) => {
    setExpandedPicker((current) => (current === picker ? null : picker));
  };

  const handleChangePasswordPress = () => {
    if (!user) {
      Alert.alert('Change password', 'Sign in to change your password.');
      return;
    }

    if (!hasEmailPasswordProvider(user)) {
      Alert.alert(
        'Change password',
        'This account uses social sign-in. Use Forgot password on the sign-in screen if you need to set an email password.',
      );
      return;
    }

    setChangePasswordOpen(true);
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

  const displayEmail = user?.email ?? '—';
  const displayId = user?.uid ?? '—';
  const headerHeight = insets.top + r.scale(52);

  return (
    <View style={styles.root}>
      <View style={[styles.headerShell, { paddingTop: insets.top }]}>
        <BlurView
          intensity={Platform.OS === 'android' ? 72 : 58}
          tint="dark"
          style={StyleSheet.absoluteFill}
          experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
        />
        <View style={[StyleSheet.absoluteFill, styles.headerTint]} />
        <View
          style={[
            styles.header,
            {
              paddingHorizontal: r.horizontalPadding,
              minHeight: r.scale(52),
              maxWidth: r.contentMaxWidth,
              alignSelf: 'center',
              width: '100%',
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
            <Ionicons name="chevron-back" size={r.scale(22)} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { fontSize: r.scale(18) }]}>Settings</Text>
            <Text style={[styles.headerSubtitle, { fontSize: r.scale(11), marginTop: r.scale(2) }]}>
              Account & preferences
            </Text>
          </View>
          <View style={{ width: r.scale(36) }} />
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
            paddingTop: r.scale(18),
            paddingBottom: Math.max(insets.bottom, r.scale(24)) + r.scale(24),
            minHeight: r.height - headerHeight,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SettingsSection title="Profile">
          <SettingsProfileCard
            username={username}
            bio={bio}
            photoUrl={photoUrl}
            onEditPress={() => setEditProfileOpen(true)}
          />
        </SettingsSection>

        <SettingsSection title="Account">
          <SettingsRow
            label="Mail"
            value={displayEmail}
            icon="mail-outline"
            iconOnly
            valueEllipsize="middle"
          />
          <SettingsRow
            label="ID"
            value={displayId}
            icon="finger-print-outline"
            iconOnly
            valueEllipsize="middle"
          />
          <SettingsRow
            label="Change password"
            icon="key-outline"
            showChevron
            onPress={handleChangePasswordPress}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Preferences">
          <SettingsChoiceRow
            label="Theme"
            value={theme}
            options={THEME_OPTIONS}
            expanded={expandedPicker === 'theme'}
            onToggle={() => togglePicker('theme')}
            onChange={setTheme}
          />
          <SettingsChoiceRow
            label="Language"
            value={language}
            options={LANGUAGE_OPTIONS}
            expanded={expandedPicker === 'language'}
            onToggle={() => togglePicker('language')}
            onChange={setLanguage}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Notifications">
          <SettingsRow
            label="Push notifications"
            icon="notifications-outline"
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
            icon="mail-unread-outline"
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
          <SettingsRow
            label="Help"
            icon="help-circle-outline"
            showChevron
            onPress={() => comingSoon('Help')}
          />
          <SettingsRow
            label="Privacy"
            icon="shield-outline"
            showChevron
            onPress={() => comingSoon('Privacy')}
          />
          <SettingsRow
            label="Terms"
            icon="document-text-outline"
            showChevron
            onPress={() => comingSoon('Terms')}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Security" separated>
          <SettingsRow
            label="Sign out"
            icon="log-out-outline"
            destructive
            centered
            onPress={handleSignOut}
          />
          <SettingsRow
            label="Delete account"
            icon="trash-outline"
            destructive
            centered
            onPress={handleDeleteAccount}
          />
        </SettingsSection>

        <View style={[styles.versionWrap, { marginTop: r.scale(8), gap: r.scale(4) }]}>
          <Text style={[styles.versionBrand, { fontSize: r.scale(13) }]}>AEREA</Text>
          <Text style={[styles.version, { fontSize: r.scale(12) }]}>Version {APP_VERSION}</Text>
        </View>
      </ScrollView>

      <EditProfileModal
        visible={editProfileOpen}
        username={username}
        bio={bio}
        photoUrl={photoUrl}
        onClose={() => setEditProfileOpen(false)}
        onSave={updateProfile}
      />

      <ChangePasswordModal
        visible={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  headerShell: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  headerTint: {
    backgroundColor: 'rgba(10, 12, 20, 0.42)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.38)',
    fontWeight: '500',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  versionWrap: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  versionBrand: {
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  version: {
    color: 'rgba(255,255,255,0.24)',
    fontWeight: '500',
  },
});
