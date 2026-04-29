import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from './components/GradientBackground';

export default function App() {
  return (
    <SafeAreaProvider>
      <GradientBackground>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content} />
        </SafeAreaView>
        <StatusBar style="light" />
      </GradientBackground>
    </SafeAreaProvider>
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
});
