import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Safe import — expo-location may not work in all Expo Go versions
let Location = null;
try {
  Location = require('expo-location');
} catch (e) {
  console.warn('[VYAAS] expo-location not available:', e.message);
}

import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import shared from '../styles/style';
import ScreenWrapper from '../components/ScreenWrapper';
import { authAPI } from '../services/api';

const indianStates = [
  'Andaman & Nicobar', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh',
  'Dadra & Nagar Haveli', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

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

const matchState = (regionName) => {
  if (!regionName) return null;
  const trimmed = regionName.trim();
  if (stateNameMap[trimmed]) return stateNameMap[trimmed];
  const lower = trimmed.toLowerCase();
  const direct = indianStates.find(s => s.toLowerCase() === lower);
  if (direct) return direct;
  return indianStates.find(s => lower.includes(s.toLowerCase()) || s.toLowerCase().includes(lower)) || null;
};

export default function RegisterScreen() {
  const navigation = useNavigation();
  
  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [farmSize, setFarmSize] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [currentCrop, setCurrentCrop] = useState('');
  
  // Logic State
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const formatPhone = (text) => {
    const digits = text.replace(/\D/g, "");
    return digits.slice(0, 10);
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

      let place = null;

      if (Platform.OS === 'web') {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`,
            { headers: { 'User-Agent': 'VyaasApp/1.0' } }
          );
          const data = await response.json();
          if (data && data.address) {
            place = {
              region: data.address.state,
              city: data.address.city || data.address.county || data.address.district || data.address.state_district,
              subregion: data.address.suburb,
              district: data.address.state_district
            };
          }
        } catch (webError) {
          console.warn('[VYAAS] Web geocode failed:', webError);
        }
      } else {
        const results = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (results && results.length > 0) {
          place = results[0];
        }
      }

      if (place) {
        const detectedState = matchState(place.region);
        const detectedDistrict = place.district || place.subregion || place.city || '';

        setState(detectedState || state);
        setDistrict(detectedDistrict || district);

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

  const handleSendOtp = async () => {
    if (!name || !phone || !farmSize || !state || !district) {
      Alert.alert("Missing Fields", "Please fill all required fields before sending OTP.");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      Alert.alert("Invalid", "Please enter a valid 10-digit phone number");
      return;
    }

    const fullPhone = `+91${cleanPhone}`;
    setLoading(true);
    try {
      await authAPI.sendOtp(fullPhone);
      setOtpSent(true);
      Alert.alert("Success", "OTP sent to your phone number.");
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || error.detail || "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!otp) {
      Alert.alert("Invalid", "Please enter the OTP.");
      return;
    }

    const fullPhone = `+91${phone}`;
    setLoading(true);
    try {
      // 1. Verify OTP
      await authAPI.verifyOtp(fullPhone, otp);
      
      // 2. Register Farmer Profile
      const farmerData = {
        name,
        phone: fullPhone,
        total_farm_size_acres: farmSize,
        state,
        district,
        current_crop: currentCrop
      };
      const response = await authAPI.register(farmerData);
      
      if (response.success) {
        // Save ID and navigate to Main Tabs
        await AsyncStorage.setItem('farmer_id', response.farmer_id);
        await AsyncStorage.setItem('farm_state', state);
        await AsyncStorage.setItem('farm_district', district);
        Alert.alert("Success", "Account created successfully!");
        navigation.navigate('MainTabs');
      }
    } catch (error) {
      // ✅ IMPROVED: Better error message extraction
      const errorMessage = error.message || error.detail || error.response?.data?.detail || "Could not verify OTP or register profile.";
      console.log('[REGISTER] Error during registration:', error);
      Alert.alert(
        "Registration Failed",
        errorMessage
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Fill in your details to get started.</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Raju Kumar"
              placeholderTextColor="#A0A0A0"
              value={name}
              onChangeText={setName}
              editable={!otpSent && !loading}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <View style={styles.phoneInputContainer}>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={styles.phoneInput}
                placeholder="9876543210"
                placeholderTextColor="#A0A0A0"
                value={phone}
                onChangeText={(text) => setPhone(formatPhone(text))}
                keyboardType="phone-pad"
                maxLength={10}
                editable={!otpSent && !loading}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Farm Size (acres) *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 5.5"
              placeholderTextColor="#A0A0A0"
              value={farmSize}
              onChangeText={setFarmSize}
              keyboardType="numeric"
              editable={!otpSent && !loading}
            />
          </View>

          {/* Location Detection Section */}
          <TouchableOpacity
            style={styles.detectButton}
            onPress={handleDetectLocation}
            disabled={detectingLocation || otpSent || loading}
          >
            {detectingLocation ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Text style={styles.detectButtonText}>📍 Use Current Location</Text>
            )}
          </TouchableOpacity>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: SPACING.sm }]}>
              <Text style={styles.label}>State *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Maharashtra"
                placeholderTextColor="#A0A0A0"
                value={state}
                onChangeText={setState}
                editable={!otpSent && !loading}
              />
            </View>
            <View style={[styles.formGroup, { flex: 1, marginLeft: SPACING.sm }]}>
              <Text style={styles.label}>District *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Pune"
                placeholderTextColor="#A0A0A0"
                value={district}
                onChangeText={setDistrict}
                editable={!otpSent && !loading}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Current Crop (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Wheat, Sugarcane"
              placeholderTextColor="#A0A0A0"
              value={currentCrop}
              onChangeText={setCurrentCrop}
              editable={!otpSent && !loading}
            />
          </View>

          {!otpSent ? (
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSendOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Send OTP</Text>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.otpSection}>
              <Text style={styles.label}>Enter OTP sent to +91 {phone}</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 6-digit OTP"
                placeholderTextColor="#A0A0A0"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                editable={!loading}
              />
              <TouchableOpacity
                style={[styles.button, { marginTop: SPACING.md }, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Verify & Register</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: SPACING.xl,
    paddingBottom: SPACING.xxl * 2,
  },
  title: {
    ...shared.screenTitleLarge,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...shared.screenSubtitle,
    marginBottom: SPACING.xl,
  },
  formGroup: {
    marginBottom: SPACING.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: FONTS.sizes.sm,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: FONTS.sizes.md,
    backgroundColor: COLORS.surface,
    color: COLORS.textPrimary,
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  countryCode: {
    fontSize: FONTS.sizes.md,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginRight: SPACING.sm,
    paddingRight: SPACING.sm,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  phoneInput: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    paddingVertical: SPACING.md,
    color: COLORS.textPrimary,
  },
  button: {
    ...shared.primaryButton,
    marginTop: SPACING.md,
  },
  buttonDisabled: shared.buttonDisabled,
  buttonText: shared.primaryButtonText,
  otpSection: {
    marginTop: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: '#F5F5F5',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
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
});
