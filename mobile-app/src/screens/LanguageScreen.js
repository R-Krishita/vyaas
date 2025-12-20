// src/screens/LanguageScreen.js
// Language selection screen - English is default

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

const languages = [
  { id: 'en', name: 'English', flag: '🇬🇧', isDefault: true },
  { id: 'hi', name: 'हिंदी', flag: '🇮🇳', isDefault: false },
  { id: 'mr', name: 'मराठी', flag: '🇮🇳', isDefault: false },
];

const LanguageScreen = ({ navigation }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('en'); // English default

  const handleLanguageSelect = (langId) => {
    setSelectedLanguage(langId);
  };

  const handleContinue = () => {
    // Store language preference (would use AsyncStorage in production)
    navigation.replace('OTPLogin');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <Text style={styles.title}>Select Language</Text>
        <Text style={styles.subtitle}>भाषा चुनें</Text>
        
        {/* Language Options */}
        <View style={styles.languageList}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.id}
              style={[
                styles.languageCard,
                selectedLanguage === lang.id && styles.languageCardSelected,
              ]}
              onPress={() => handleLanguageSelect(lang.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.flag}>{lang.flag}</Text>
              <Text style={[
                styles.languageName,
                selectedLanguage === lang.id && styles.languageNameSelected,
              ]}>
                {lang.name}
              </Text>
              {lang.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>DEFAULT</Text>
                </View>
              )}
              {selectedLanguage === lang.id && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Continue Button */}
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueText}>Continue →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  languageList: {
    marginBottom: SPACING.xl,
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  languageCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#E8F5E9',
  },
  flag: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  languageName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  languageNameSelected: {
    color: COLORS.primary,
  },
  defaultBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    marginRight: SPACING.sm,
  },
  defaultText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  checkmark: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  continueText: {
    color: COLORS.textLight,
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
  },
});

export default LanguageScreen;
