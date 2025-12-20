// App.js
// Main app entry point with web-responsive container

import React from 'react';
import { View, StyleSheet, Platform, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';

const { width } = Dimensions.get('window');

export default function App() {
  // For web, wrap in a centered phone-like container
  if (Platform.OS === 'web') {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.webContainer}>
          <View style={styles.phoneFrame}>
            <StatusBar style="light" />
            <AppNavigator />
          </View>
        </View>
      </GestureHandlerRootView>
    );
  }

  // For mobile, render normally
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <AppNavigator />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: 20,
  },
  phoneFrame: {
    width: 390,
    height: 844,
    maxHeight: '95vh',
    backgroundColor: '#FFF8E1',
    borderRadius: 40,
    overflow: 'hidden',
    boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
    border: '8px solid #333',
  },
});
