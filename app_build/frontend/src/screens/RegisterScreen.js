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
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import shared from '../styles/style';
import ScreenWrapper from '../components/ScreenWrapper';
import { authAPI } from '../services/api';

export default function RegisterScreen() {
  const navigation = useNavigation();
  
  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [farmSize, setFarmSize] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [currentCrop, setCurrentCrop] = useState('');
  
  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const formatPhone = (text) => {
    const digits = text.replace(/\D/g, "");
    return digits.slice(0, 10);
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
      Alert.alert(
        "Registration Failed",
        error.response?.data?.detail || error.message || "Could not verify OTP or register profile."
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
              value={farmSize}
              onChangeText={setFarmSize}
              keyboardType="numeric"
              editable={!otpSent && !loading}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: SPACING.sm }]}>
              <Text style={styles.label}>State *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Maharashtra"
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
  }
});
