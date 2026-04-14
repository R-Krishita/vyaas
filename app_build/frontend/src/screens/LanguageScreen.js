// src/screens/LanguageScreen.js
// Language selection screen with Dropdown UI

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList, Dimensions, Platform } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import shared from '../styles/style';
import { useLanguage } from '../context/LanguageContext';

const languages = [
  { id: 'en', name: 'English', flag: '🇬🇧', isDefault: true },
  { id: 'hi', name: 'हिंदी', flag: '🇮🇳', isDefault: false },
  { id: 'mr', name: 'मराठी', flag: '🇮🇳', isDefault: false },
  { id: 'gu', name: 'ગુજરાતી', flag: '🇮🇳', isDefault: false },
  { id: 'ta', name: 'தமிழ்', flag: '🇮🇳', isDefault: false },
  { id: 'te', name: 'తెలుగు', flag: '🇮🇳', isDefault: false },
  { id: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳', isDefault: false },
  { id: 'bn', name: 'বাংলা', flag: '🇮🇳', isDefault: false },
  { id: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳', isDefault: false },
  { id: 'ml', name: 'മലയാളം', flag: '🇮🇳', isDefault: false },
  { id: 'or', name: 'ଓଡ଼ିଆ', flag: '🇮🇳', isDefault: false },
  { id: 'as', name: 'অসমীয়া', flag: '🇮🇳', isDefault: false },
];

const LanguageScreen = ({ navigation }) => {
  const { language, setLanguage, t } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Default to En if language not found in list (safe fallback)
  const currentLang = languages.find(l => l.id === language) || languages[0];

  const handleLanguageSelect = (langId) => {
    setLanguage(langId);
    setIsDropdownOpen(false);
  };

  const handleContinue = () => {
    navigation.replace('Welcome');
  };

  const renderDropdownItem = ({ item: lang }) => (
    <TouchableOpacity
      style={[
        styles.dropdownItem,
        language === lang.id && styles.dropdownItemSelected,
      ]}
      onPress={() => handleLanguageSelect(lang.id)}
    >
      <Text style={styles.dropdownFlag}>{lang.flag}</Text>
      <Text style={[
        styles.dropdownItemText,
        language === lang.id && styles.dropdownItemTextSelected,
      ]}>
        {lang.name}
      </Text>
      {language === lang.id && (
        <Text style={styles.checkmark}>✓</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('welcome_title')}</Text>
          <Text style={styles.subtitle}>{t('language_subtitle')}</Text>
          <Text style={styles.subtitleHindi}>{t('language_subtitle_hindi')}</Text>
        </View>

        {/* Dropdown Section */}
        <View style={styles.formSection}>
          <Text style={styles.label}>{t('language_label')} / भाषा</Text>

          <TouchableOpacity
            style={styles.dropdownTrigger}
            onPress={() => setIsDropdownOpen(true)}
            activeOpacity={0.8}
          >
            <View style={styles.triggerContent}>
              <Text style={styles.triggerFlag}>{currentLang.flag}</Text>
              <Text style={styles.triggerText}>{currentLang.name}</Text>
            </View>
            <Text style={styles.arrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Continue Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.continueText}>{t('continue_button')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Dropdown Overlay - uses absolute positioning instead of Modal to stay within the app container on web */}
      {isDropdownOpen && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setIsDropdownOpen(false)}
          />
          <View style={styles.dropdownModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('select_language')}</Text>
              <TouchableOpacity onPress={() => setIsDropdownOpen(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={languages}
              renderItem={renderDropdownItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={true}
              style={styles.flatListContainer}
              contentContainerStyle={styles.dropdownList}
            />
          </View>
        </View>
      )}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: shared.screenContainer,
  content: shared.contentPadded,
  header: {
    marginTop: SPACING.xl,
    alignItems: 'center',
  },
  title: shared.screenTitleLarge,
  subtitle: {
    ...shared.screenSubtitle,
    marginBottom: SPACING.xs,
  },
  subtitleHindi: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  formSection: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    ...shared.fieldLabel,
    marginLeft: SPACING.xs,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  triggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  triggerFlag: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  triggerText: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  arrow: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  footer: {
    marginBottom: SPACING.xl,
  },
  continueButton: shared.primaryButton,
  continueText: shared.primaryButtonText,
  // Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    zIndex: 999,
  },
  dropdownModal: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    maxHeight: Dimensions.get('window').height * 0.6,
    overflow: 'hidden',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 480,
    ...SHADOWS.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  closeButton: {
    fontSize: 20,
    color: COLORS.textSecondary,
    padding: SPACING.xs,
  },
  flatListContainer: {
    flexShrink: 1,
  },
  dropdownList: {
    padding: SPACING.sm,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xs,
  },
  dropdownItemSelected: {
    backgroundColor: '#E8F5E9',
  },
  dropdownFlag: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  dropdownItemText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    flex: 1,
  },
  dropdownItemTextSelected: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  checkmark: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default LanguageScreen;
