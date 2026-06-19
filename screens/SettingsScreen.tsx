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
import SettingsRow from '../components/SettingsRow';
import SettingsSection from '../components/SettingsSection';
import { MOCK_OWN_BIO } from '../data/mockUsers';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../contexts/NavigationContext';
import { getProfileUsername } from '../utils/profile';
import { useResponsive } from '../utils/responsive';

const APP_VERSION = '1.0.0';

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

  const username = getProfileUsername(user?.email, user?.displayName);

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
            paddingTop: r.scale(8),
            paddingBottom: r.scale(32),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSection title="Profile">
          <SettingsRow
            icon="person-outline"
            label="Username"
            value={username}
          />
          <SettingsRow
            icon="create-outline"
            label="Edit bio"
            value={MOCK_OWN_BIO.length > 22 ? `${MOCK_OWN_BIO.slice(0, 22)}…` : MOCK_OWN_BIO}
            showChevron
            onPress={() => comingSoon('Edit bio')}
          />
          <SettingsRow
            icon="camera-outline"
            label="Change photo"
            showChevron
            onPress={() => comingSoon('Change photo')}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Account">
          <SettingsRow icon="mail-outline" label="Email" value={user?.email ?? '—'} isLast />
        </SettingsSection>

        <SettingsSection title="Notifications">
          <SettingsRow
            icon="notifications-outline"
            label="Push notifications"
            rightElement={
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ false: 'rgba(255,255,255,0.15)', true: 'rgba(96,165,250,0.55)' }}
                thumbColor="#fff"
              />
            }
          />
          <SettingsRow
            icon="megaphone-outline"
            label="Product updates"
            rightElement={
              <Switch
                value={emailUpdates}
                onValueChange={setEmailUpdates}
                trackColor={{ false: 'rgba(255,255,255,0.15)', true: 'rgba(96,165,250,0.55)' }}
                thumbColor="#fff"
              />
            }
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Support">
          <SettingsRow
            icon="help-circle-outline"
            label="Help center"
            showChevron
            onPress={() => comingSoon('Help center')}
          />
          <SettingsRow
            icon="shield-checkmark-outline"
            label="Privacy policy"
            showChevron
            onPress={() => comingSoon('Privacy policy')}
          />
          <SettingsRow
            icon="document-text-outline"
            label="Terms of service"
            showChevron
            onPress={() => comingSoon('Terms of service')}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Session">
          <SettingsRow
            icon="log-out-outline"
            label="Sign out"
            destructive
            onPress={handleSignOut}
            isLast
          />
        </SettingsSection>

        <Text style={[styles.version, { fontSize: r.scale(12), marginTop: r.scale(4) }]}>
          AEREA v{APP_VERSION}
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
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
