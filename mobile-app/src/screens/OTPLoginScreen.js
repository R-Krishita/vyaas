import React, { useState } from "react";
import { View, TextInput, Button, Alert, StyleSheet, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";

// 🔹 TEMPORARY: Firebase OTP auth bypassed for development
// TODO: Re-enable Firebase auth before production

export default function OTPLoginScreen() {
  const navigation = useNavigation();
  const [phone, setPhone] = useState("");

  const handleLogin = () => {
    // Just check if any number is entered (minimum 10 digits)
    if (phone.replace(/\D/g, "").length >= 10) {
      // Navigate directly to main dashboard
      navigation.reset({
        index: 0,
        routes: [{ name: "MainTabs" }],
      });
    } else {
      Alert.alert(
        "Invalid",
        "Please enter a valid phone number (min 10 digits)",
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌿 Welcome to VYAAS</Text>
      <Text style={styles.subtitle}>Enter your phone number to continue</Text>

      <TextInput
        placeholder="+91 XXXXXXXXXX"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={styles.input}
      />

      <Button title="Continue" onPress={handleLogin} color="#2E7D32" />

      <Text style={styles.devNote}>
        🔧 Dev Mode: Any 10+ digit number will work
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 80,
    alignItems: "center",
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
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    width: "100%",
    fontSize: 18,
  },
  devNote: {
    marginTop: 20,
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
});
