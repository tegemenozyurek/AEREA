import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import PlaceholderScreen from './PlaceholderScreen';

export default function AccountScreen() {
  const { user, logout } = useAuth();

  return (
    <PlaceholderScreen title="Account">
      {user?.email ? <Text style={styles.email}>{user.email}</Text> : null}
      <TouchableOpacity
        style={styles.signOut}
        activeOpacity={0.6}
        onPress={() => {
          void logout();
        }}
        hitSlop={8}
      >
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>
    </PlaceholderScreen>
  );
}

const styles = StyleSheet.create({
  email: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 14,
    letterSpacing: 0.2,
    marginTop: 12,
  },
  signOut: {
    marginTop: 28,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  signOutText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
