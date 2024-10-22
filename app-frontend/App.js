import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import { AuthProvider, AuthContext } from './AuthProvider';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const AuthStack = createNativeStackNavigator();

export default function App() {
  return (
      <AuthProvider>
        <NavigationContainer>
          <AuthStack.Navigator initialRouteName='Login'>
            <AuthStack.Screen options={{headerShown: false}} name = 'Login' component = {LoginScreen} />
            <AuthStack.Screen options={{headerShown: false}} name= 'Signup' component = {SignupScreen} />
          </AuthStack.Navigator>
        </NavigationContainer>
      </AuthProvider>
  );
}

const styles = StyleSheet.create({
});
