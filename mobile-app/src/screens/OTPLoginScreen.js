// mobile-app/src/screens/OTPLoginScreen.js
// Phone number input screen for OTP login

import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import shared from '../styles/style';
import ScreenWrapper from '../components/ScreenWrapper';
import { sendOtp } from '../services/authApi';

export default function OTPLoginScreen() {
  const navigation = useNavigation();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const formatPhone = (text) => {
    const digits = text.replace(/\D/g, "");
    return digits.slice(0, 10);
  };

  const handleLogin = async () => {
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      Alert.alert("Invalid", "Please enter a valid 10-digit phone number");
      return;
    }

    const fullPhone = `+91${cleanPhone}`;
    setLoading(true);
    try {
      await sendOtp(fullPhone);
      navigation.navigate("OTPVerification", { phone: fullPhone });
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || error.detail || "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper style={styles.container}>
      <Text style={styles.emoji}>🌿</Text>
      <Text style={styles.title}>Welcome to VYAAS</Text>
      <Text style={styles.subtitle}>
        Enter your phone number to continue
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.countryCode}>+91</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter phone number"
          placeholderTextColor="#999"
          value={phone}
          onChangeText={(text) => setPhone(formatPhone(text))}
          keyboardType="phone-pad"
          maxLength={10}
          editable={!loading}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Continue</Text>
        )}
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  emoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  title: {
    ...shared.screenTitleLarge,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...shared.screenSubtitle,
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    width: "100%",
    marginBottom: SPACING.lg,
  },
  countryCode: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginRight: SPACING.sm,
    paddingRight: SPACING.sm,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  input: {
    flex: 1,
    fontSize: 18,
    paddingVertical: SPACING.md,
    color: COLORS.textPrimary,
  },
  button: {
    ...shared.primaryButton,
    width: "100%",
  },
  buttonDisabled: shared.buttonDisabled,
  buttonText: shared.primaryButtonText,
});
