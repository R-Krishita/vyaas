// src/constants/api.js
// API configuration for the Smart Ayurvedic Crop Advisor

import { Platform } from 'react-native';

// Prefer configuring via Expo public env var:
// - PowerShell: $env:EXPO_PUBLIC_API_BASE_URL="http://192.168.1.34:8000"; npm start
// - Cmd: set EXPO_PUBLIC_API_BASE_URL=http://192.168.1.34:8000 && npm start
const envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

// Sensible dev defaults:
// - Android emulator: 10.0.2.2 (maps to host machine localhost)
// - iOS simulator / Web: localhost
const defaultHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
export const API_BASE_URL = envBaseUrl || `http://${defaultHost}:8001`;

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
  
  // Chatbot
  chatbotAsk: '/api/chatbot/ask',
  
  // PDF
  generatePdf: '/api/plan/pdf',
};

export default { API_BASE_URL, API_ENDPOINTS };
