import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import { AuthProvider, AuthContext } from './AuthProvider';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from './screens/WelcomeScreen';
import HomeScreen from './screens/HomeScreen';
import SetUpProfile from './screens/SetUpProfile';

const AuthStack = createNativeStackNavigator();

export default function App() {
  return (
      <AuthProvider>
        <NavigationContainer>
          <AuthStack.Navigator initialRouteName='Login'>
            <AuthStack.Screen options = {{headerShown: false}} name = 'Login' component = { LoginScreen } />
            <AuthStack.Screen options = {{headerShown: false}} name = 'Signup' component = { SignupScreen } />
            <AuthStack.Screen options = {{headerShown: false}} name = 'Welcome' component = { WelcomeScreen }/>
            <AuthStack.Screen options = {{headerShown: false}} name = 'SetUpProfile' component = { SetUpProfile }/>
          </AuthStack.Navigator>
        </NavigationContainer>
      </AuthProvider>
  );
}

const styles = StyleSheet.create({
});