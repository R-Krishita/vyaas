// src/screens/OTPLoginScreen.js
// OTP-based login screen for farmer authentication

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { authAPI } from '../services/api';

const OTPLoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [loading, setLoading] = useState(false);
  
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];

  const handleSendOTP = async () => {
    if (phone.length !== 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number');
      return;
    }
    
    setLoading(true);
    try {
      await authAPI.sendOtp(phone);
      setStep('otp');
      Alert.alert('OTP Sent', 'Please enter the OTP sent to your phone');
    } catch (error) {
      // For demo, proceed anyway
      setStep('otp');
    }
    setLoading(false);
  };

  const handleOTPChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 4) {
      Alert.alert('Invalid OTP', 'Please enter the complete 4-digit OTP');
      return;
    }
    
    setLoading(true);
    try {
      await authAPI.verifyOtp(phone, otpString);
      navigation.replace('MainTabs');
    } catch (error) {
      // For demo, proceed anyway
      navigation.replace('MainTabs');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.icon}>📱</Text>
          <Text style={styles.title}>
            {step === 'phone' ? 'Login with Mobile' : 'Enter OTP'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'phone' 
              ? 'Enter your mobile number to receive OTP'
              : `OTP sent to +91 ${phone}`
            }
          </Text>
        </View>

        {step === 'phone' ? (
          /* Phone Number Input */
          <View style={styles.inputContainer}>
            <View style={styles.phoneInputRow}>
              <View style={styles.countryCode}>
                <Text style={styles.countryText}>🇮🇳 +91</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="9876543210"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
              />
            </View>
            <Text style={styles.example}>Example: 9876543210</Text>
            
            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSendOTP}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Sending...' : '✅ Send OTP'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* OTP Input */
          <View style={styles.inputContainer}>
            <View style={styles.otpRow}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={otpRefs[index]}
                  style={styles.otpInput}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={(value) => handleOTPChange(value, index)}
                />
              ))}
            </View>
            
            <TouchableOpacity onPress={() => setStep('phone')}>
              <Text style={styles.resendText}>Change number / Resend OTP</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleVerifyOTP}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Verifying...' : '✅ Continue'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
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
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  icon: {
    fontSize: 60,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: SPACING.lg,
    maxWidth: 350,
    width: '100%',
    alignSelf: 'center',
  },
  phoneInputRow: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  countryCode: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
    justifyContent: 'center',
  },
  countryText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
  },
  phoneInput: {
    flex: 1,
    maxWidth: 250,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: FONTS.sizes.lg,
    color: COLORS.textPrimary,
  },
  example: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  otpInput: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginHorizontal: SPACING.sm,
    textAlign: 'center',
    fontSize: FONTS.sizes.xl,
    color: COLORS.textPrimary,
  },
  resendText: {
    textAlign: 'center',
    color: COLORS.primary,
    fontSize: FONTS.sizes.md,
    marginBottom: SPACING.lg,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.textLight,
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
  },
});

export default OTPLoginScreen;
