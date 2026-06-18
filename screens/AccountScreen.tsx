import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useResponsive } from '../utils/responsive';

export default function AccountScreen() {
  const { user, logout } = useAuth();
  const r = useResponsive();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { paddingHorizontal: r.horizontalPadding }]}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.body}>
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
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  email: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 14,
    letterSpacing: 0.2,
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
