// src/components/ScreenWrapper.js
// Reusable screen container with SafeAreaView and common background

import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

const ScreenWrapper = ({ children, style }) => (
  <SafeAreaView style={[styles.container, style]}>
    {children}
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

export default ScreenWrapper;
