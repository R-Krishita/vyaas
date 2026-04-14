// src/constants/api.js
// API configuration for the Smart Ayurvedic Crop Advisor

import { Platform } from 'react-native';

// Your dev machine's LAN IP (same as the one shown in Expo QR code)
// Update this if your IP changes, or set EXPO_PUBLIC_API_BASE_URL env var
const DEV_MACHINE_IP = '192.168.1.33';

// Temporary tunnel URL for Android (bypass firewall)
const TUNNEL_URL = 'https://giant-deer-dress.loca.lt';

const getDevBaseUrl = () => {
  // On web, localhost works fine.
  if (Platform.OS === 'web') return 'http://localhost:8000';
  
  // on Android/iOS, use tunnel if available, else LAN IP
  return TUNNEL_URL || `http://${DEV_MACHINE_IP}:8000`;
};

// Use env var if set (for production), otherwise use dev default
const envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
export const API_BASE_URL = envBaseUrl || getDevBaseUrl();

console.log('[VYAAS] API_BASE_URL =', API_BASE_URL);

export const API_ENDPOINTS = {
  // Auth
  sendOtp: '/api/auth/otp',
  verifyOtp: '/api/auth/verify',
  
  // Farm
  saveFarm: '/api/farm/save',
  getFarmHealth: '/api/farm/health',
  
  // ML/Recommendations
  getRecommendations: '/api/ml/recommend',
  
  // Market
  getMarketPrices: '/api/market/prices',
  getPriceHistory: '/api/market/prices/history',
  getBestMandis: '/api/market/best-mandis',
  getSupportedCrops: '/api/market/supported-crops',
  
  // PDF
  generatePdf: '/api/plan/pdf',
};

export default { API_BASE_URL, API_ENDPOINTS };
