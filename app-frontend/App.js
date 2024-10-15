import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import LoginScreen from './screens/LoginScreen';

export default function App() {
  return (
      <>
        <LoginScreen />
        <StatusBar style="auto" />
      </>
  );
}

const styles = StyleSheet.create({
});
