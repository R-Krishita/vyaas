// mobile-app/src/services/authApi.js
// API service for OTP authentication
// TODO: Update BASE_URL after backend is running

import axios from 'axios';

// ⚠️ UPDATE THIS URL to match your backend
const BASE_URL = 'http://192.168.1.X:8001/api'; // Replace with your backend IP

const authApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Send OTP to phone number
 * @param {string} phone - Phone number with country code (e.g., "+919876543210")
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const sendOtp = async (phone) => {
  try {
    const response = await authApi.post('/auth/otp', { phone });
    return response.data;
  } catch (error) {
    console.error('Send OTP Error:', error);
    throw error.response?.data || { message: 'Failed to send OTP' };
  }
};

/**
 * Verify OTP code
 * @param {string} phone - Phone number
 * @param {string} otp - OTP code entered by user
 * @returns {Promise<{success: boolean, token: string, farmer_id: string}>}
 */
export const verifyOtp = async (phone, otp) => {
  try {
    const response = await authApi.post('/auth/verify', { phone, otp });
    return response.data;
  } catch (error) {
    console.error('Verify OTP Error:', error);
    throw error.response?.data || { message: 'Invalid OTP' };
  }
};

export default authApi;
