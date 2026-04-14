// mobile-app/src/screens/OTPVerificationScreen.js
// Screen for entering and verifying OTP code

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { sendOtp, verifyOtp } from "../services/authApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import shared from '../styles/style';

export default function OTPVerificationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { phone } = route.params;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const inputRefs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleOtpChange = (value, index) => {
    if (value.length > 1) {
      // Handle paste
      const pasted = value.slice(0, 6).split("");
      const newOtp = [...otp];
      pasted.forEach((digit, i) => {
        if (index + i < 6) newOtp[index + i] = digit;
      });
      setOtp(newOtp);
      if (pasted.length + index >= 6) {
        inputRefs.current[5]?.blur();
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      Alert.alert("Invalid OTP", "Please enter the complete 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await verifyOtp(phone, otpCode);
      if (response.success) {
        // Store auth token
        await AsyncStorage.setItem("authToken", response.token);
        await AsyncStorage.setItem("farmerId", response.farmer_id);

        // Navigate to main app
        navigation.reset({
          index: 0,
          routes: [{ name: "MainTabs" }],
        });
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      await sendOtp(phone);
      setTimer(30);
      Alert.alert("OTP Sent", "A new OTP has been sent to your phone.");
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to resend OTP.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code sent to{"\n"}
        <Text style={styles.phone}>{phone}</Text>
      </Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={[styles.otpInput, digit && styles.otpInputFilled]}
            value={digit}
            onChangeText={(value) => handleOtpChange(value, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={6}
            selectTextOnFocus
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.verifyButton, loading && styles.buttonDisabled]}
        onPress={handleVerify}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.verifyButtonText}>Verify & Continue</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleResend}
        disabled={timer > 0}
        style={styles.resendContainer}
      >
        <Text style={[styles.resendText, timer > 0 && styles.resendDisabled]}>
          {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...shared.centeredContainer,
    backgroundColor: COLORS.surface,
  },
  title: {
    ...shared.screenTitleLarge,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...shared.screenSubtitle,
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  phone: {
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: SPACING.xl,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: COLORS.textPrimary,
  },
  otpInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: '#E8F5E9',
  },
  verifyButton: {
    ...shared.primaryButton,
    width: "100%",
  },
  buttonDisabled: shared.buttonDisabled,
  verifyButtonText: shared.primaryButtonText,
  resendContainer: {
    marginTop: SPACING.lg,
  },
  resendText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.md,
    fontWeight: "500",
  },
  resendDisabled: {
    color: COLORS.textMuted,
  },
});
