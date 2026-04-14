// src/constants/theme.js
// Color theme and styling constants for the Smart Ayurvedic Crop Advisor

export const COLORS = {
  // Primary palette
  primary: '#2E7D32',      // Forest Green
  primaryDark: '#1B5E20',
  primaryLight: '#4CAF50',
  
  // Secondary palette
  secondary: '#795548',    // Earth Brown
  secondaryDark: '#5D4037',
  secondaryLight: '#8D6E63',
  
  // Accent
  accent: '#FFC107',       // Sunshine Yellow
  accentDark: '#FF8F00',
  
  // Background
  background: '#FFF8E1',   // Cream White
  backgroundDark: '#F5F5DC',
  surface: '#FFFFFF',
  
  // Status colors
  success: '#4CAF50',
  error: '#E57373',
  warning: '#FFB74D',
  info: '#64B5F6',
  
  // Text colors
  textPrimary: '#212121',
  textSecondary: '#757575',
  textLight: '#FFFFFF',
  textMuted: '#9E9E9E',
  
  // Border
  border: '#E0E0E0',
  borderLight: '#F5F5F5',
};

export const FONTS = {
  regular: 'System',
  bold: 'System',
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    title: 28,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 50,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

export default { COLORS, FONTS, SPACING, RADIUS, SHADOWS };
