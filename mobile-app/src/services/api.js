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

// Auth token interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    // const token = await AsyncStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  sendOtp: (phone) => apiClient.post(API_ENDPOINTS.sendOtp, { phone }),
  verifyOtp: (phone, otp) => apiClient.post(API_ENDPOINTS.verifyOtp, { phone, otp }),
};

// Farm APIs
export const farmAPI = {
  saveFarmDetails: (farmData) => apiClient.post(API_ENDPOINTS.saveFarm, farmData),
  getFarmHealth: (farmId) => apiClient.get(`${API_ENDPOINTS.getFarmHealth}?farm_id=${farmId}`),
};

// Recommendation APIs
export const recommendAPI = {
  getCropRecommendations: (farmId) => 
    apiClient.post(API_ENDPOINTS.getRecommendations, { farm_id: farmId }),
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
  
  getBestMandis: (crop, state = null) => {
    let url = `${API_ENDPOINTS.getBestMandis}?crop=${crop}`;
    if (state) url += `&state=${state}`;
    return apiClient.get(url);
  },
  
  getSupportedCrops: () => apiClient.get(API_ENDPOINTS.getSupportedCrops),
};


// PDF API
export const pdfAPI = {
  generateCultivationPlan: (farmerId, crop) => 
    apiClient.post(API_ENDPOINTS.generatePdf, { farmer_id: farmerId, crop }),
};

export default apiClient;
