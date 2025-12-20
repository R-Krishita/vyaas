// src/constants/api.js
// API configuration for the Smart Ayurvedic Crop Advisor

// Change this to your computer's IP address (run `ipconfig` to find it)
// Your phone must be on the same WiFi network as your computer
export const API_BASE_URL = 'http://192.168.1.34:8000';

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
