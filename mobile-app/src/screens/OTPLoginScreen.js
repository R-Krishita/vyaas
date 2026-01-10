import React, { useEffect, useState } from "react";
import { View, TextInput, Button, Alert, StyleSheet } from "react-native";
import { signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { auth } from "../firebase";

export default function OTPLoginScreen() {
  const [phone, setPhone] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [otp, setOtp] = useState("");

  // 🔹 REQUIRED for Firebase Web OTP
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
        }
      );
    }
  }, []);

  const sendOTP = async () => {
    try {
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phone,
        window.recaptchaVerifier
      );
      setConfirmation(confirmationResult);
      Alert.alert("OTP sent");
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const verifyOTP = async () => {
    try {
      await confirmation.confirm(otp);
      Alert.alert("Login Success");
    } catch {
      Alert.alert("Invalid OTP");
    }
  };

  return (
    <View style={styles.container}>
      {/* 🔴 THIS IS MANDATORY */}
      <div id="recaptcha-container"></div>

      <TextInput
        placeholder="+91XXXXXXXXXX"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
      />

      <Button title="Send OTP" onPress={sendOTP} />

      {confirmation && (
        <>
          <TextInput
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            style={styles.input}
          />
          <Button title="Verify OTP" onPress={verifyOTP} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 80 },
  input: { borderWidth: 1, padding: 12, marginVertical: 10 },
});
