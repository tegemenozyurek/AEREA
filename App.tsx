import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import GradientBackground from './components/GradientBackground';

export default function App() {
  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.logo}>AEREA</Text>
        </View>
      </SafeAreaView>
      <StatusBar style="light" />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    color: '#008D41',
    fontSize: 64,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
