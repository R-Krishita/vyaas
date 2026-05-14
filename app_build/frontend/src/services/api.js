// src/services/api.js
// API service for making HTTP requests to the backend

import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    // Extract error details for better UX
    const errorData = error.response?.data || error.data || {};
    const errorMessage = errorData.detail || errorData.message || error.message || 'Request failed';
    const errorWithMessage = {
      ...errorData,
      message: errorMessage,
      status: error.response?.status,
    };
    return Promise.reject(errorWithMessage);
  }
);

// Auth APIs
export const authAPI = {
  sendOtp: (phone) => apiClient.post(API_ENDPOINTS.sendOtp, { phone }),
  verifyOtp: (phone, otp) => apiClient.post(API_ENDPOINTS.verifyOtp, { phone, otp }),
  register: (farmerData) => apiClient.post(API_ENDPOINTS.register, farmerData),
  getProfile: (farmerId) => apiClient.get(`${API_ENDPOINTS.getProfile}/${farmerId}`),
};

// Farm APIs
export const farmAPI = {
  saveFarmDetails: (farmData) => apiClient.post(API_ENDPOINTS.saveFarm, farmData),
  getFarmHealth: (farmId) => apiClient.get(`${API_ENDPOINTS.getFarmHealth}?farm_id=${farmId}`),
};

// Recommendation APIs
export const mlAPI = {
  getRecommendations: (farmId) => apiClient.post(API_ENDPOINTS.getRecommendations, { farm_id: farmId }),
  submitFeedback: (feedbackData) => apiClient.post('/api/ml/feedback', feedbackData),
  getFeedbackHistory: (farmerId) => apiClient.get(`${API_ENDPOINTS.getFeedbackHistory}/${farmerId}`),
  getCropDetails: (crops) => 
    apiClient.get(`/api/ml/crop-details?crop=${crops.join(',')}`),
};

// Market APIs - Real Mandi prices from data.gov.in
export const marketAPI = {
  getMarketPrices: (crop, state = null, district = null) => {
    let url = `${API_ENDPOINTS.getMarketPrices}?crop=${crop}`;
    if (state) url += `&state=${state}`;
    if (district) url += `&district=${district}`;
    return apiClient.get(url);
  },
  
  getPriceHistory: (crop, days = 30) => 
    apiClient.get(`${API_ENDPOINTS.getPriceHistory}?crop=${crop}&days=${days}`),
    
  getHarvestPrediction: (crop, growthDays, currentPrice) => 
    apiClient.get(`/api/market/predict-harvest?crop=${crop}&growth_days=${growthDays}&current_price=${currentPrice}`),
  
  getBestMandis: (crop, state = null) => {
    let url = `${API_ENDPOINTS.getBestMandis}?crop=${crop}`;
    if (state) url += `&state=${state}`;
    return apiClient.get(url);
  },
  
  getSupportedCrops: () => apiClient.get(API_ENDPOINTS.getSupportedCrops),
};


// Feedback API — explicit crop selection (NOT implicit browse)
export const feedbackAPI = {
  submitChoice: (farmerId, farmId, recommendedCrops, chosenCrop) =>
    apiClient.post('/api/ml/feedback', {
      farmer_id: farmerId,
      farm_id: farmId,
      recommended_crops: recommendedCrops,
      chosen_crop: chosenCrop,
    }),
};

// PDF API
export const pdfAPI = {
  generateCultivationPlan: (farmerId, crop) => 
    apiClient.post(API_ENDPOINTS.generatePdf, { farmer_id: farmerId, crop }),
};

export default apiClient;
