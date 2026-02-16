// mobile-app/src/screens/OTPLoginScreen.js
// Phone number input screen for OTP login
// 🔧 DEV MODE: Hardcoded to pass through without backend

import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import shared from '../styles/style';

export default function OTPLoginScreen() {
  const navigation = useNavigation();
  const [phone, setPhone] = useState("");

  const formatPhone = (text) => {
    const digits = text.replace(/\D/g, "");
    return digits.slice(0, 10);
  };

  const handleLogin = () => {
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      Alert.alert("Invalid", "Please enter a valid 10-digit phone number");
      return;
    }

    // 🔧 DEV MODE: Skip OTP, go directly to main app
    navigation.reset({
      index: 0,
      routes: [{ name: "MainTabs" }],
    });
  };

  return (
    <View style={styles.container}>
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
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>

      <Text style={styles.devNote}>
        🔧 Dev Mode: Any 10+ digit number will work
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...shared.centeredContainer,
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
  buttonText: shared.primaryButtonText,
  devNote: {
    marginTop: SPACING.lg,
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    fontStyle: "italic",
  },
});
