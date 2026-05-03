// src/screens/FarmDetailsScreen.js
// Farm details input form with location detection and manual fallback

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';

// Safe import — expo-location may not work in all Expo Go versions
let Location = null;
try {
  Location = require('expo-location');
} catch (e) {
  console.warn('[VYAAS] expo-location not available:', e.message);
}
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import shared from '../styles/style';
import { farmAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ScreenWrapper from '../components/ScreenWrapper';
import FormInput from '../components/FormInput';
import PickerInput from '../components/PickerInput';
import StepperInput from '../components/StepperInput';

const indianStates = [
  'Andaman & Nicobar', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh',
  'Dadra & Nagar Haveli', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];
const soilTypes = [
  'Alluvial', 'Black soil', 'Clay', 'Clay loam', 'Humus-rich',
  'Laterite', 'Light soil', 'Loamy', 'Marshy', 'Red laterite',
  'Red loamy', 'Rocky', 'Sandy', 'Sandy loam', 'Silty clay'
];
const waterSources = ['Well', 'Borewell', 'Canal', 'River', 'Rainwater'];
const irrigationTypes = ['Drip', 'Sprinkler', 'Flood', 'Manual'];
const seasons = ['Kharif', 'Rabi', 'Zaid'];

// Hindi/regional → English state name mapping (Android geocoder returns local names)
const stateNameMap = {
  'महाराष्ट्र': 'Maharashtra', 'आंध्र प्रदेश': 'Andhra Pradesh', 'अरुणाचल प्रदेश': 'Arunachal Pradesh',
  'असम': 'Assam', 'बिहार': 'Bihar', 'छत्तीसगढ़': 'Chhattisgarh', 'गोवा': 'Goa',
  'गुजरात': 'Gujarat', 'हरियाणा': 'Haryana', 'हिमाचल प्रदेश': 'Himachal Pradesh',
  'झारखंड': 'Jharkhand', 'कर्नाटक': 'Karnataka', 'केरल': 'Kerala', 'मध्य प्रदेश': 'Madhya Pradesh',
  'मणिपुर': 'Manipur', 'मेघालय': 'Meghalaya', 'मिज़ोरम': 'Mizoram', 'नागालैंड': 'Nagaland',
  'ओडिशा': 'Odisha', 'पंजाब': 'Punjab', 'राजस्थान': 'Rajasthan', 'सिक्किम': 'Sikkim',
  'तमिलनाडु': 'Tamil Nadu', 'तमिल नाडु': 'Tamil Nadu', 'तेलंगाना': 'Telangana',
  'त्रिपुरा': 'Tripura', 'उत्तर प्रदेश': 'Uttar Pradesh', 'उत्तराखंड': 'Uttarakhand',
  'पश्चिम बंगाल': 'West Bengal', 'दिल्ली': 'Delhi', 'चंडीगढ़': 'Chandigarh',
  'पुदुचेरी': 'Puducherry', 'लद्दाख': 'Ladakh', 'लक्षद्वीप': 'Lakshadweep',
};

// Best-effort match of a geocoded region name to our indianStates list
const matchState = (regionName) => {
  if (!regionName) return null;
  const trimmed = regionName.trim();
  // 1. Check Hindi/regional name map
  if (stateNameMap[trimmed]) return stateNameMap[trimmed];
  // 2. Direct English match (case-insensitive)
  const lower = trimmed.toLowerCase();
  const direct = indianStates.find(s => s.toLowerCase() === lower);
  if (direct) return direct;
  // 3. Partial / contains match
  return indianStates.find(s => lower.includes(s.toLowerCase()) || s.toLowerCase().includes(lower)) || null;
};

const FarmDetailsScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [formData, setFormData] = useState({
    state: '',
    district: '',
    farmSize: '',
    soilType: 'Black soil',
    soilPh: '6.5',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    rainfall: '',
    temperature: '',
    soilMoisture: '50',
    organicCarbon: '1.2',
    humidity: '60',
    waterSource: 'Well',
    irrigationType: 'Drip',
    season: 'Kharif',
    previousCrop: '',
    budget: ''
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDetectLocation = async () => {
    if (!Location) {
      Alert.alert(
        'Not Available',
        'Location detection is not available on this device. Please select your state and enter your district manually.'
      );
      return;
    }
    setDetectingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('[VYAAS] Location permission status:', status);
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to auto-detect your state and district. Please enter them manually below.'
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = position.coords;
      console.log('[VYAAS] GPS coords:', latitude, longitude);

      let place = null;

      if (Platform.OS === 'web') {
        // Expo reverseGeocodeAsync is not supported on web (SDK 49+).
        // Use OpenStreetMap Nominatim API as fallback (free, requires User-Agent).
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`,
            { headers: { 'User-Agent': 'VyaasApp/1.0' } }
          );
          const data = await response.json();
          console.log('[VYAAS] Web geocode result:', data);
          
          if (data && data.address) {
            place = {
              region: data.address.state,
              // District can be in various fields depending on location
              city: data.address.city || data.address.county || data.address.district || data.address.state_district,
              subregion: data.address.suburb,
              district: data.address.state_district
            };
          }
        } catch (webError) {
          console.warn('[VYAAS] Web geocode failed:', webError);
        }
      } else {
        // Native (Android/iOS)
        const results = await Location.reverseGeocodeAsync({ latitude, longitude });
        console.log('[VYAAS] Reverse geocode result:', JSON.stringify(results, null, 2));
        if (results && results.length > 0) {
          place = results[0];
        }
      }

      if (place) {
        // Log all available fields
        console.log('[VYAAS] Place fields:', Object.keys(place).join(', '));
        console.log('[VYAAS] region:', place.region, '| city:', place.city, '| subregion:', place.subregion, '| district:', place.district);

        const detectedState = matchState(place.region);
        const detectedDistrict = place.district || place.subregion || place.city || '';
        console.log('[VYAAS] Matched state:', detectedState, '| District:', detectedDistrict);

        setFormData(prev => ({
          ...prev,
          state: detectedState || prev.state,
          district: detectedDistrict || prev.district,
        }));

        const stateName = detectedState || place.region || 'Unknown';
        Alert.alert(
          '📍 Location Detected',
          `State: ${stateName}\nDistrict: ${detectedDistrict || 'Unknown'}\n\nYou can edit these fields manually if needed.`
        );
      } else {
        Alert.alert('Location Error', 'Could not determine your address. Please enter state and district manually.');
      }
    } catch (error) {
      console.error('[VYAAS] Location detection error:', error);
      Alert.alert('Location Error', `Failed to detect location: ${error.message}\n\nPlease enter state and district manually.`);
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleSubmit = async () => {
    const farm_id = 'FARM_001'; // Single-user demo; extend to per-user later
    try {
      await farmAPI.saveFarmDetails({ ...formData, farm_id });
      // Persist district and state for MarketInsightsScreen local mandi lookup
      if (formData.district) {
        await AsyncStorage.setItem('farm_district', formData.district);
      }
      if (formData.state) {
        await AsyncStorage.setItem('farm_state', formData.state);
      }
      console.log('[VYAAS] Farm details saved, navigating to Recommendations');
      navigation.navigate('Recommendations', { farm_id, farmData: formData });
    } catch (error) {
      console.warn('[VYAAS] Could not save farm details, proceeding to demo mode:', error?.message);
      navigation.navigate('Recommendations', { farm_id, farmData: formData });
    }
  };

  return (
    <ScreenWrapper>
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
            <TouchableOpacity
              style={styles.detectButton}
              onPress={handleDetectLocation}
              disabled={detectingLocation}
            >
              {detectingLocation ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Text style={styles.detectButtonText}>📍 Use Current Location</Text>
              )}
            </TouchableOpacity>
            <PickerInput
              label="State" icon="🗺️"
              value={formData.state} options={indianStates}
              onSelect={(v) => updateField('state', v)}
            />
            <FormInput
              label="District" icon="📍"
              value={formData.district} placeholder="e.g., Pune"
              onChangeText={(v) => updateField('district', v)}
            />
            <FormInput
              label="Farm Size (Acres)" icon="📐"
              value={formData.farmSize} placeholder="e.g., 2.5"
              onChangeText={(v) => updateField('farmSize', v)}
              keyboardType="decimal-pad"
            />
            <PickerInput
              label="Soil Type" icon="🪨"
              value={formData.soilType} options={soilTypes}
              onSelect={(v) => updateField('soilType', v)}
            />
            <StepperInput
              label="Soil pH" icon="🧪"
              value={formData.soilPh}
              onChange={(v) => updateField('soilPh', v)}
              min={4} max={9} step={0.5}
            />
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.stepTitle}>🌱 Soil & Water</Text>
            <FormInput
              label="Nitrogen (kg/ha)" icon="🌿"
              value={formData.nitrogen} placeholder="e.g., 150"
              onChangeText={(v) => updateField('nitrogen', v)}
              keyboardType="number-pad"
            />
            <FormInput
              label="Phosphorus (kg/ha)" icon="🧬"
              value={formData.phosphorus} placeholder="e.g., 40"
              onChangeText={(v) => updateField('phosphorus', v)}
              keyboardType="number-pad"
            />
            <FormInput
              label="Potassium (kg/ha)" icon="⚗️"
              value={formData.potassium} placeholder="e.g., 80"
              onChangeText={(v) => updateField('potassium', v)}
              keyboardType="number-pad"
            />
            <FormInput
              label="Annual Rainfall (mm)" icon="🌧️"
              value={formData.rainfall} placeholder="e.g., 800"
              onChangeText={(v) => updateField('rainfall', v)}
              keyboardType="number-pad"
            />
            <FormInput
              label="Temperature (°C)" icon="🌡️"
              value={formData.temperature} placeholder="e.g., 28"
              onChangeText={(v) => updateField('temperature', v)}
              keyboardType="number-pad"
            />
            <FormInput
              label="Soil Moisture (%)" icon="💧"
              value={formData.soilMoisture} placeholder="e.g., 50"
              onChangeText={(v) => updateField('soilMoisture', v)}
              keyboardType="number-pad"
            />
            <FormInput
              label="Organic Carbon (%)" icon="🍂"
              value={formData.organicCarbon} placeholder="e.g., 1.2"
              onChangeText={(v) => updateField('organicCarbon', v)}
              keyboardType="number-pad"
            />
            <FormInput
              label="Air Humidity (%)" icon="🌫️"
              value={formData.humidity} placeholder="e.g., 60"
              onChangeText={(v) => updateField('humidity', v)}
              keyboardType="number-pad"
            />
            <PickerInput
              label="Water Source" icon="💧"
              value={formData.waterSource} options={waterSources}
              onSelect={(v) => updateField('waterSource', v)}
            />
            <PickerInput
              label="Irrigation Type" icon="🚿"
              value={formData.irrigationType} options={irrigationTypes}
              onSelect={(v) => updateField('irrigationType', v)}
            />
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.stepTitle}>💰 Budget & Preferences</Text>
            <PickerInput
              label="Current Season" icon="🗓️"
              value={formData.season} options={seasons}
              onSelect={(v) => updateField('season', v)}
            />
            <FormInput
              label="Previous Crop" icon="🌾"
              value={formData.previousCrop} placeholder="e.g., Wheat"
              onChangeText={(v) => updateField('previousCrop', v)}
            />
            <FormInput
              label="Budget (₹)" icon="💰"
              value={formData.budget} placeholder="e.g., 50000"
              onChangeText={(v) => updateField('budget', v)}
              keyboardType="number-pad"
            />
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
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
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
    marginBottom: SPACING.md,
  },
  detectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    backgroundColor: '#E8F5E9',
    marginBottom: SPACING.lg,
    minHeight: 44,
  },
  detectButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.primary,
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
