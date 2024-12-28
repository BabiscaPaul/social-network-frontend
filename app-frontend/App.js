import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { AuthProvider, AuthContext } from './AuthProvider';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import SetUpProfile from './screens/SetUpProfile';
import HomeScreen from './screens/HomeScreen';
import CreatePostScreen from './screens/CreatePostScreen';

const AuthStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStackNavigator = () => {
  return (
    <AuthStack.Navigator initialRouteName="Login">
      <AuthStack.Screen
        options={{ headerShown: false }}
        name="Login"
        component={LoginScreen}
      />
      <AuthStack.Screen
        options={{ headerShown: false }}
        name="Signup"
        component={SignupScreen}
      />
      <AuthStack.Screen
        options={{ headerShown: false }}
        name="Welcome"
        component={WelcomeScreen}
      />
      <AuthStack.Screen
        options={{ headerShown: false }}
        name="SetUpProfile"
        component={SetUpProfile}
      />
    </AuthStack.Navigator>
  );
};

const MainTabNavigator = () => {
  return (
    <Tab.Navigator initialRouteName="Home">
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="CreatePost"
        component={CreatePostScreen}
      />
    </Tab.Navigator>
  );
};

const RootNavigator = () => {
  const { isLoggedIn } = useContext(AuthContext);

  return isLoggedIn ? <MainTabNavigator /> : <AuthStackNavigator />;
};

const App = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;

const styles = StyleSheet.create({
});