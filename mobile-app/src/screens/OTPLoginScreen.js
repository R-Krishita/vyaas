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
import { sendOtp } from "../services/authApi";

export default function OTPLoginScreen() {
  const navigation = useNavigation();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const formatPhone = (text) => {
    // Remove non-digits
    const digits = text.replace(/\D/g, "");
    // Format: keep only digits, max 10
    return digits.slice(0, 10);
  };

  const handleSendOtp = async () => {
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      Alert.alert("Invalid", "Please enter a valid 10-digit phone number");
      return;
    }

    const fullPhone = `+91${cleanPhone}`;
    setLoading(true);

    try {
      const response = await sendOtp(fullPhone);
      if (response.success) {
        navigation.navigate("OTPVerification", { phone: fullPhone });
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🌿</Text>
      <Text style={styles.title}>Welcome to VYAAS</Text>
      <Text style={styles.subtitle}>
        Enter your phone number to receive an OTP
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

      <Text style={styles.disclaimer}>
        By continuing, you agree to our Terms of Service and Privacy Policy
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 16,
    width: "100%",
    marginBottom: 24,
  },
  countryCode: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginRight: 8,
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: "#ddd",
  },
  input: {
    flex: 1,
    fontSize: 18,
    paddingVertical: 16,
    color: "#333",
  },
  button: {
    backgroundColor: "#2E7D32",
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  disclaimer: {
    marginTop: 24,
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
