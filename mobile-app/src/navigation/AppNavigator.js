// src/navigation/AppNavigator.js
// Main navigation setup with persistent bottom tabs

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { COLORS } from '../constants/theme';

// Import screens
import SplashScreen from '../screens/SplashScreen';
import LanguageScreen from '../screens/LanguageScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import OTPLoginScreen from '../screens/OTPLoginScreen';
import HomeScreen from '../screens/HomeScreen';
import FarmDetailsScreen from '../screens/FarmDetailsScreen';
import RecommendationsScreen from '../screens/RecommendationsScreen';
import MarketInsightsScreen from '../screens/MarketInsightsScreen';
import CultivationPlanScreen from '../screens/CultivationPlanScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const CropsStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

// Tab Icon Component
const TabIcon = ({ icon, label, focused }) => (
  <View style={{ alignItems: 'center', paddingTop: 8 }}>
    <Text style={{ fontSize: 24 }}>{icon}</Text>
    <Text style={{
      fontSize: 10,
      color: focused ? COLORS.primary : '#9E9E9E',
      marginTop: 2,
      fontWeight: focused ? '600' : '400',
    }}>
      {label}
    </Text>
  </View>
);

const screenOptions = {
  headerStyle: {
    backgroundColor: COLORS.primary,
  },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: {
    fontWeight: 'bold',
  },
};

// Home Tab Stack - includes all home-related screens
const HomeStackScreen = () => (
  <HomeStack.Navigator screenOptions={screenOptions}>
    <HomeStack.Screen
      name="HomeMain"
      component={HomeScreen}
      options={{ headerTitle: '🌿 Smart Ayurvedic Crop Advisor' }}
    />
    <HomeStack.Screen
      name="FarmDetails"
      component={FarmDetailsScreen}
      options={{ headerTitle: '🚜 Farm Details' }}
    />
    <HomeStack.Screen
      name="MarketInsights"
      component={MarketInsightsScreen}
      options={{ headerTitle: '📊 Market Prices' }}
    />
    <HomeStack.Screen
      name="CultivationPlan"
      component={CultivationPlanScreen}
      options={{ headerTitle: '📋 Cultivation Plan' }}
    />
    <HomeStack.Screen
      name="Chatbot"
      component={ChatbotScreen}
      options={{ headerTitle: '🤖 Crop Assistant' }}
    />
  </HomeStack.Navigator>
);

// Crops Tab Stack
const CropsStackScreen = () => (
  <CropsStack.Navigator screenOptions={screenOptions}>
    <CropsStack.Screen
      name="CropsMain"
      component={RecommendationsScreen}
      options={{ headerTitle: '🌾 Crop Recommendations' }}
    />
    <CropsStack.Screen
      name="CultivationPlan"
      component={CultivationPlanScreen}
      options={{ headerTitle: '📋 Cultivation Plan' }}
    />
    <CropsStack.Screen
      name="MarketInsights"
      component={MarketInsightsScreen}
      options={{ headerTitle: '📊 Market Prices' }}
    />
  </CropsStack.Navigator>
);

// Profile Tab Stack
const ProfileStackScreen = () => (
  <ProfileStack.Navigator screenOptions={screenOptions}>
    <ProfileStack.Screen
      name="ProfileMain"
      component={ProfileScreen}
      options={{ headerTitle: '👤 My Profile' }}
    />
    <ProfileStack.Screen
      name="FarmDetails"
      component={FarmDetailsScreen}
      options={{ headerTitle: '🚜 Farm Details' }}
    />
  </ProfileStack.Navigator>
);

// Farm Tab Stack - direct access to farm details
const FarmStackScreen = () => (
  <HomeStack.Navigator screenOptions={screenOptions}>
    <HomeStack.Screen
      name="FarmMain"
      component={FarmDetailsScreen}
      options={{ headerTitle: '🚜 Farm Details' }}
    />
    <HomeStack.Screen
      name="Recommendations"
      component={RecommendationsScreen}
      options={{ headerTitle: '🌾 Recommendations' }}
    />
  </HomeStack.Navigator>
);

// Market Tab Stack - direct access to market prices
const MarketStack = createNativeStackNavigator();
const MarketStackScreen = () => (
  <MarketStack.Navigator screenOptions={screenOptions}>
    <MarketStack.Screen
      name="MarketMain"
      component={MarketInsightsScreen}
      options={{ headerTitle: '📊 Market Prices' }}
    />
  </MarketStack.Navigator>
);

// Bottom Tab Navigator - always visible
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopColor: '#E0E0E0',
        height: 65,
        paddingBottom: 8,
        paddingTop: 4,
      },
      tabBarShowLabel: false,
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeStackScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon icon="🏠" label="Home" focused={focused} />
        ),
      }}
    />
    <Tab.Screen
      name="Farm"
      component={FarmStackScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon icon="🚜" label="Farm" focused={focused} />
        ),
      }}
    />
    <Tab.Screen
      name="Crops"
      component={CropsStackScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon icon="🌿" label="Crops" focused={focused} />
        ),
      }}
    />
    <Tab.Screen
      name="Market"
      component={MarketStackScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon icon="📊" label="Market" focused={focused} />
        ),
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileStackScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon icon="👤" label="Profile" focused={focused} />
        ),
      }}
    />
  </Tab.Navigator>
);

// Main App Navigator (Auth flow only)
const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false }}
    >
      {/* Auth Flow */}
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="OTPLogin" component={OTPLoginScreen} />

      {/* Main App with persistent tabs */}
      <Stack.Screen name="MainTabs" component={MainTabs} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;
