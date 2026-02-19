// mobile-app/src/services/authApi.js
// API service for OTP authentication — uses the shared API client

import apiClient from './api';
import { API_ENDPOINTS } from '../constants/api';

/**
 * Send OTP to phone number
 * @param {string} phone - Phone number with country code (e.g., "+919876543210")
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const sendOtp = async (phone) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.sendOtp, { phone });
    return response; // apiClient interceptor already returns response.data
  } catch (error) {
    console.error('Send OTP Error:', error);
    throw error.response?.data || error.data || { message: 'Failed to send OTP' };
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
    const response = await apiClient.post(API_ENDPOINTS.verifyOtp, { phone, otp });
    return response; // apiClient interceptor already returns response.data
  } catch (error) {
    console.error('Verify OTP Error:', error);
    throw error.response?.data || error.data || { message: 'Invalid OTP' };
  }
};

export default { sendOtp, verifyOtp };
