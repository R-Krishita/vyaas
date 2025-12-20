// src/screens/SplashScreen.js
// Splash screen with app logo and loading animation

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants/theme';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    // Navigate to language selection after 2.5 seconds
    const timer = setTimeout(() => {
      navigation.replace('Language');
    }, 2500);
    
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* App Logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoEmoji}>🌿</Text>
        <Text style={styles.appName}>Smart Ayurvedic</Text>
        <Text style={styles.appName}>Crop Advisor</Text>
      </View>
      
      {/* Tagline */}
      <Text style={styles.tagline}>
        Your trusted guide for Ayurvedic farming
      </Text>
      
      {/* Loading indicator */}
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoEmoji: {
    fontSize: 80,
    marginBottom: SPACING.md,
  },
  appName: {
    fontSize: FONTS.sizes.title,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
  },
  tagline: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.sm,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
});

export default SplashScreen;
