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
import ProfileScreen from './screens/ProfileScreen';
import MessagesScreen from './screens/MessagesScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import MyPosts from './screens/MyPosts';
import SharedPosts from './screens/SharedPosts';
import FriendsScreen from './screens/FriendsScreen';
import SearchScreen from './screens/SearchScreen';
import NotificationScreen from './screens/NotificationScreen';
import ChatDetailScreen from './screens/ChatDetailScreen';
import CreateChatScreen from './screens/CreateChatScreen';
import UserProfile from './screens/UserProfile';

const AuthStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const ProfileStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator(); 
const ChatStack = createNativeStackNavigator();
const SearchStack = createNativeStackNavigator();

import { Home, Search, MessageCircle, PlusSquare, User } from 'lucide-react-native';

const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator>
      {/* HomeScreen is the initial screen in the Home stack */}
      <HomeStack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ headerShown: true, headerTitle: "" }} // Header is managed inside HomeScreen
      />
      {/* NotificationScreen can be navigated to from HomeScreen */}
      <HomeStack.Screen
        name="NotificationScreen"
        component={NotificationScreen}
        options={{
          title: 'Notifications', // Customize the header title
          headerBackTitle: 'Back', // Customize the back button text
          headerTitle: ""
        }}
      />
    </HomeStack.Navigator>
  );
};

const ChatStackNavigator = () => {
  return (
    <ChatStack.Navigator>
      {/* HomeScreen is the initial screen in the Home stack */}
      <ChatStack.Screen
        name="Chats"
        component={MessagesScreen}
      />
      {/* NotificationScreen can be navigated to from HomeScreen */}
      <ChatStack.Screen
        name="ChatDetail"
        component={ChatDetailScreen}
        options={{
          headerBackTitle: 'Back',
          headerTitle: ""
        }}
      />

      <ChatStack.Screen 
        name="CreateChat"
        component={CreateChatScreen}
        options={{
          headerBackTitle: 'Back',
          headerTitle: ""
        }}
      />
    </ChatStack.Navigator>
  );
};


const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator
    >
      {/* ProfileScreen shown first */}
      <ProfileStack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />

      {/* Additional screen for editing profile */}
      <ProfileStack.Screen
        name="EditProfileScreen"
        component={EditProfileScreen} 
        options={{ headerShown: false }}
      />

      <ProfileStack.Screen
        name="MyPostsScreen"
        component={MyPosts} 
        options={{ headerShown: false }}
      />

      <ProfileStack.Screen
        name="SharedPostsScreen"
        component={SharedPosts}
        options={{ headerShown: false }}
      />

      <ProfileStack.Screen
        name="FriendsScreen"
        component={FriendsScreen}
        options={{ headerShown: false }}
      />
    </ProfileStack.Navigator>
  );
};

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

const SearchStackNavigator = () => {
  return (
    <SearchStack.Navigator>
      {/* SearchScreen is the initial screen in the Search stack */}
      <SearchStack.Screen
        name="SearchScreen"
        component={SearchScreen}
        options={{ headerShown: false }}
      />
      {/* UserProfile can be navigated to from SearchScreen */}
      <SearchStack.Screen
        name="UserProfile"
        component={UserProfile}
        options={{ headerShown: false }}
      />
    </SearchStack.Navigator>
  );
};

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          paddingBottom: 10,
          paddingTop: 10,
          height: 85,
          position: 'absolute',
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: '#007AFF',  // iOS blue color
        tabBarInactiveTintColor: '#8E8E93',
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Home
              size={24}
              color={color}
              strokeWidth={2}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Search"
        component={SearchStackNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Search
              size={24}
              color={color}
              strokeWidth={2}
            />
          ),
        }}
      />

      <Tab.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <PlusSquare
              size={24}
              color={color}
              strokeWidth={2}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Messages"
        component={ChatStackNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MessageCircle
              size={24}
              color={color}
              strokeWidth={2}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <User
              size={24}
              color={color}
              strokeWidth={2}
            />
          ),
        }}
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