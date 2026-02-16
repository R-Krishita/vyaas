// src/screens/FarmDetailsScreen.js
// Farm details input form with 20 agricultural fields

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import shared from '../styles/style';
import { farmAPI } from '../services/api';

const soilTypes = ['Black', 'Red', 'Alluvial', 'Laterite', 'Sandy', 'Clay'];
const waterSources = ['Well', 'Borewell', 'Canal', 'River', 'Rainwater'];
const irrigationTypes = ['Drip', 'Sprinkler', 'Flood', 'Manual'];
const seasons = ['Kharif', 'Rabi', 'Zaid'];

const FarmDetailsScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    state: 'Maharashtra',
    district: '',
    farmSize: '',
    soilType: 'Black',
    soilPh: '6.5',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    rainfall: '',
    temperature: '',
    waterSource: 'Well',
    irrigationType: 'Drip',
    season: 'Kharif',
    previousCrop: '',
    budget: '',
    laborCount: '',
    organicPreference: true,
    sunlightHours: '7',
    elevation: '',
    humidity: '',
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      await farmAPI.saveFarmDetails(formData);
      navigation.navigate('Recommendations');
    } catch (error) {
      navigation.navigate('Recommendations'); // Demo: proceed anyway
    }
  };

  const renderDropdown = (label, icon, options, field) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{icon} {label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.optionsRow}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionChip,
                formData[field] === option && styles.optionChipSelected,
              ]}
              onPress={() => updateField(field, option)}
            >
              <Text style={[
                styles.optionText,
                formData[field] === option && styles.optionTextSelected,
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderInput = (label, icon, field, placeholder, keyboardType = 'default') => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{icon} {label}</Text>
      <TextInput
        style={styles.textInput}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        value={formData[field]}
        onChangeText={(value) => updateField(field, value)}
        keyboardType={keyboardType}
      />
    </View>
  );

  const renderSlider = (label, icon, field, min, max, unit) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{icon} {label}: {formData[field]} {unit}</Text>
      <View style={styles.sliderRow}>
        <Text style={styles.sliderMin}>{min}</Text>
        <View style={styles.sliderTrack}>
          <View 
            style={[
              styles.sliderFill, 
              { width: `${((parseFloat(formData[field]) - min) / (max - min)) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.sliderMax}>{max}</Text>
      </View>
      <View style={styles.sliderButtons}>
        {[min, (min + max) / 2, max].map((val) => (
          <TouchableOpacity
            key={val}
            style={styles.sliderButton}
            onPress={() => updateField(field, val.toString())}
          >
            <Text style={styles.sliderButtonText}>{val}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>Step {step} of 3</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {step === 1 && (
          <View>
            <Text style={styles.stepTitle}>📍 Location & Land</Text>
            {renderInput('State', '🗺️', 'state', 'e.g., Maharashtra')}
            {renderInput('District', '📍', 'district', 'e.g., Pune')}
            {renderInput('Farm Size (Acres)', '📐', 'farmSize', 'e.g., 2.5', 'decimal-pad')}
            {renderDropdown('Soil Type', '🪨', soilTypes, 'soilType')}
            {renderSlider('Soil pH', '🧪', 'soilPh', 4, 9, '')}
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.stepTitle}>🌱 Soil & Water</Text>
            {renderInput('Nitrogen (kg/ha)', '🌿', 'nitrogen', 'e.g., 150', 'number-pad')}
            {renderInput('Phosphorus (kg/ha)', '🧬', 'phosphorus', 'e.g., 40', 'number-pad')}
            {renderInput('Potassium (kg/ha)', '⚗️', 'potassium', 'e.g., 80', 'number-pad')}
            {renderInput('Annual Rainfall (mm)', '🌧️', 'rainfall', 'e.g., 800', 'number-pad')}
            {renderDropdown('Water Source', '💧', waterSources, 'waterSource')}
            {renderDropdown('Irrigation Type', '🚿', irrigationTypes, 'irrigationType')}
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.stepTitle}>💰 Budget & Preferences</Text>
            {renderDropdown('Current Season', '🗓️', seasons, 'season')}
            {renderInput('Previous Crop', '🌾', 'previousCrop', 'e.g., Wheat')}
            {renderInput('Budget (₹)', '💰', 'budget', 'e.g., 50000', 'number-pad')}
            {renderInput('Labor Available', '👷', 'laborCount', 'e.g., 3', 'number-pad')}
            {renderSlider('Sunlight Hours', '☀️', 'sunlightHours', 4, 12, 'hrs')}
            
            <TouchableOpacity
              style={[
                styles.toggleButton,
                formData.organicPreference && styles.toggleButtonActive,
              ]}
              onPress={() => updateField('organicPreference', !formData.organicPreference)}
            >
              <Text style={styles.toggleIcon}>🌱</Text>
              <Text style={styles.toggleText}>
                Organic Farming: {formData.organicPreference ? 'Yes' : 'No'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.buttonRow}>
        {step > 1 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setStep(step - 1)}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => {
            if (step < 3) setStep(step + 1);
            else handleSubmit();
          }}
        >
          <Text style={styles.nextButtonText}>
            {step < 3 ? 'Next →' : '🌾 Get Best Crops'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: shared.screenContainer,
  progressContainer: {
    padding: SPACING.lg,
    paddingBottom: 0,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    marginBottom: SPACING.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  scrollView: shared.scrollView,
  stepTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.lg,
  },
  fieldContainer: {
    marginBottom: SPACING.lg,
  },
  fieldLabel: shared.fieldLabel,
  textInput: shared.textInput,
  optionsRow: {
    flexDirection: 'row',
  },
  optionChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  optionChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textPrimary,
  },
  optionTextSelected: {
    color: COLORS.textLight,
    fontWeight: '600',
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderTrack: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginHorizontal: SPACING.sm,
  },
  sliderFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  sliderMin: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
  },
  sliderMax: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
  },
  sliderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  sliderButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sliderButtonText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  toggleButtonActive: {
    borderColor: COLORS.success,
    backgroundColor: '#E8F5E9',
  },
  toggleIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  toggleText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
  },
  buttonRow: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  backButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  nextButton: {
    ...shared.primaryButton,
    flex: 2,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  nextButtonText: {
    ...shared.primaryButtonText,
    fontSize: FONTS.sizes.md,
  },
});

export default FarmDetailsScreen;
