# 📱 Frontend/Mobile App Documentation

Comprehensive guide to the Vyaas React Native mobile application for farmers.

**Last Updated:** May 2026 | **Estimated Read Time:** 20 minutes

---

## 📚 Table of Contents

1. [Overview](#-overview)
2. [App Architecture](#-app-architecture)
3. [Screen Guide](#-screen-guide)
4. [Navigation Flow](#-navigation-flow)
5. [Services & API Integration](#-services--api-integration)
6. [State Management](#-state-management)
7. [Running Locally](#-running-locally)
8. [Development Guide](#-development-guide)
9. [Common Tasks](#-common-tasks)
10. [Troubleshooting](#-troubleshooting)

---

## 🎯 Overview

The **Vyaas Mobile App** is the farmer-facing interface built with:
- **React Native** — Cross-platform framework (iOS + Android)
- **Expo** — Development and deployment platform
- **React Navigation** — Screen routing and navigation
- **AsyncStorage** — Offline data persistence

**Purpose:** Help farmers make informed crop decisions by:
1. Collecting farm details (soil, climate, budget)
2. Displaying AI-generated crop recommendations
3. Showing real-time market prices
4. Providing chatbot assistance

---

## 🏗️ App Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  App.js (Entry Point)                   │
└────────────────────────┬────────────────────────────────┘
                         │
                         ↓
         ┌───────────────────────────────────┐
         │    Navigation/AppNavigator.js     │
         │  (Manages all screen stacks)      │
         └───────────────────────────────────┘
                    ↓            ↓
          ┌──────────────┐  ┌─────────────┐
          │  AuthStack   │  │  MainTabs   │
          │ (Login, OTP) │  │(5 screens)  │
          └──────────────┘  └─────────────┘

Main Tabs (Bottom Navigation):
├─ Home Screen
├─ Farm Details Screen
├─ Recommendations Screen
├─ Market Insights Screen
└─ Profile Screen

Services Layer:
├─ api.js — HTTP client with Axios
├─ authApi.js — Authentication calls
└─ AsyncStorage — Local data persistence

UI Components:
├─ Screens (10+ full-page components)
├─ Components (reusable UI elements)
├─ Styles (theme, fonts, colors)
└─ Constants (API URLs, translations)
```

---

## 📱 Screen Guide

### 1. **SplashScreen** (Entry)
**Purpose:** App loading screen

**Flow:**
- Check if user is already logged in
- Show logo & loading animation
- Navigate to Language or Auth based on login status

**Key Logic:**
```javascript
// Check if token exists
const token = await AsyncStorage.getItem('auth_token');
if (token) {
  navigation.navigate('MainTabs');
} else {
  navigation.navigate('Language');
}
```

---

### 2. **LanguageScreen** (Onboarding)
**Purpose:** Select preferred language

**Options:**
- English 🇬🇧
- Hindi 🇮🇳 (हिंदी)
- Marathi 🇲🇭 (मराठी)

**Action:**
- Saves selection to AsyncStorage
- Navigates to WelcomeScreen

---

### 3. **WelcomeScreen** (Onboarding)
**Purpose:** Introduce the app

**Features:**
- Feature cards with illustrations
- "Get Started" button
- Navigates to OTPLoginScreen

---

### 4. **OTPLoginScreen** (Authentication)
**Purpose:** Farmer login via phone number

**UI:**
```
┌─────────────────────────────────┐
│  ← Back Button (NEW)            │
│                                 │
│  📱 Login to Vyaas              │
│                                 │
│  Enter Your Phone Number        │
│  ┌──────────────────────────┐   │
│  │ +91 [    XXXXXXXXXX    ] │   │
│  └──────────────────────────┘   │
│                                 │
│  [      Send OTP      ]         │
│                                 │
└─────────────────────────────────┘
```

**Flow:**
1. User enters phone number
2. Clicks "Send OTP"
3. Backend checks if phone exists in DB
4. If exists: Sends OTP → Next screen
5. If new: Shows alert → Option to register

**Key Logic:**
```javascript
// Check phone existence
const exists = await authApi.checkPhoneExists(phone);
if (!exists) {
  Alert.alert("New Farmer", "Go to Registration?");
  // Navigate to RegisterScreen
}
```

---

### 5. **OTPVerificationScreen** (Authentication)
**Purpose:** Verify OTP sent to phone

**UI:**
```
┌─────────────────────────────────┐
│  🔐 Enter OTP                   │
│                                 │
│  Enter 6-digit code sent to     │
│  +919876543210                  │
│                                 │
│  ┌────┐┌────┐┌────┐┌────┐      │
│  │  1 ││  2 ││  3 ││  4 │      │
│  └────┘└────┘└────┘└────┘      │
│  ┌────┐┌────┐                  │
│  │  5 ││  6 │                  │
│  └────┘└────┘                  │
│                                 │
│  [    Verify OTP    ]           │
│  Don't have it? Resend          │
└─────────────────────────────────┘
```

**Features:**
- 6-digit OTP input
- Auto-focus next digit
- Shows error alert if OTP invalid ✅ (FIXED)
- Resend OTP option (5-minute cooldown)

**Error Handling (IMPROVED):**
```javascript
try {
  await authApi.verifyOtp(phone, otp);
  // Success → navigate
} catch (error) {
  const msg = error.message || error.detail || "Invalid OTP";
  Alert.alert("Invalid OTP", msg);  // ✅ User sees error!
}
```

---

### 6. **RegisterScreen** (Authentication)
**Purpose:** Create new farmer profile

**Steps:**
1. Basic info (name, phone)
2. Location (state, district)
3. Farm details (size, soil type, crop)

**Fields:**
- Full Name
- State (dropdown)
- District (dropdown)
- Farm Size (acres)
- Soil Type (dropdown)
- Current Crop (dropdown)
- OTP Verification

---

### 7. **HomeScreen** (Main Dashboard)
**Purpose:** Overview and quick actions

**Sections:**
- Hero banner ("Welcome, Farmer!")
- Farm summary card (shows farm size, soil type)
- Quick action buttons:
  - 🌾 View Recommendations
  - 📊 Market Prices
  - 💬 Chat with AI
  - ⚙️ Settings

---

### 8. **FarmDetailsScreen** (Multi-Step Form)
**Purpose:** Collect detailed farm information

**3-Step Form:**
```
Step 1: Soil Properties
├─ Nitrogen (N)
├─ Phosphorus (P)
├─ Potassium (K)
├─ pH Level
├─ Moisture
└─ Organic Carbon

Step 2: Climate & Location
├─ Temperature
├─ Rainfall
├─ Humidity
├─ Climate Zone
├─ State
└─ District

Step 3: Economics
├─ Budget (INR)
├─ Current Crop
├─ Farm Size
└─ [Save & Get Recommendations]
```

**Key Features:**
- Progress indicator (Step 1/2/3)
- Input validation
- Generates unique `farm_id`
- Saves to AsyncStorage + backend
- Navigates to Recommendations on complete

---

### 9. **RecommendationsScreen** (Results)
**Purpose:** Display crop recommendations

**UI:**
```
┌─────────────────────────────────┐
│  🌾 Top Crop Recommendations    │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 1. Tulsi            ⭐92%  │  │
│  │ Profit: ₹45,000           │  │
│  │ ✓ Suitable for your soil  │  │
│  │ [Market Comparison]       │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 2. Ashwagandha       ⭐88% │  │
│  │ Profit: ₹52,000           │  │
│  │ ✓ Good climate match      │  │
│  │ [Market Comparison]       │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 3. Turmeric          ⭐85% │  │
│  │ Profit: ₹38,000           │  │
│  │ ✓ Budget friendly         │  │
│  │ [Market Comparison]       │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

**Key Features:**
- Top 3 recommendations
- Match percentage
- Profit estimate
- Reasons (why suitable)
- "Market Comparison" button per crop

**API Call:**
```javascript
const response = await mlAPI.getRecommendations(farmId);
// ✅ Fixed: Was calling recommendAPI.getCropRecommendations()
```

---

### 10. **MarketInsightsScreen** (Market Data)
**Purpose:** Show market prices and profit comparison

**Sections:**

1. **Current Market Price**
   ```
   🌾 Tulsi - Market Prices
   
   Current Price: ₹250/kg
   Trend: ↑ Up 5% from last week
   
   Best Mandi: Pune Market (₹260)
   ```

2. **30-Day Price Trend (Chart)**
   - Line chart showing price history
   - Marked as "Simulated Data" if < 30 days actual
   - Hover shows date & price

3. **Harvest Prediction**
   ```
   Predicted Harvest Price (120 days):
   ₹235 - ₹320 (±30% from current)
   ```

4. **I Will Grow Button (NEW DESIGN)**
   ```
   Static Section Header: "I Will Grow"
   
   ┌──────────────────────────────────┐
   │  [Tulsi] [Ashwagandha] [Turmeric]│
   │  (3 clickable crop buttons)       │
   │  Selected: Tulsi ✓                │
   └──────────────────────────────────┘
   ```
   - User selects which crop to grow
   - Selection updates local state
   - Saved for recommendations

**Navigation Fix:**
- Back button now navigates to RecommendationsScreen (not Home) ✅

---

### 11. **CultivationPlanScreen** (Future)
**Purpose:** Step-by-step cultivation guide

**Content:**
- Soil preparation (days 1-7)
- Planting (day 8)
- Watering schedule
- Pest management
- Harvest timing

---

### 12. **ProfileScreen** (Settings)
**Purpose:** User profile and app settings

**Sections:**
- 👤 Profile (name, phone, location)
- 🌍 Language Selection
- 🔔 Notifications
- 📞 Help & Support
- ⚙️ About Vyaas
- 🚪 Logout

---

## 🗺️ Navigation Flow

### Auth Stack (Pre-Login)
```
SplashScreen
    ↓
LanguageScreen
    ↓
WelcomeScreen
    ↓
OTPLoginScreen
    ├─→ (Send OTP)
    ↓
OTPVerificationScreen
    ├─→ (If new user)
    ↓
RegisterScreen
    ├─→ (Form steps)
    ↓
MainTabs (Success)
```

### Main Tabs (Post-Login)
```
Bottom Tab Navigator:
├─ 🏠 Home Tab
│  └─ HomeScreen
│
├─ 🌾 Farm Tab
│  └─ FarmDetailsScreen
│
├─ 📊 Recommendations Tab
│  ├─ RecommendationsScreen
│  └─→ [Click crop] → MarketInsightsScreen
│
├─ 📈 Market Tab
│  ├─ RecommendationsScreen (first)
│  └─→ [Click Market Comparison] → MarketInsightsScreen
│      └─→ [Back] → RecommendationsScreen ✅
│
└─ 👤 Profile Tab
   └─ ProfileScreen
```

---

## 🔗 Services & API Integration

### api.js (HTTP Client)

Base Axios instance with interceptors:

```javascript
const api = axios.create({
  baseURL: BASE_URL,  // http://localhost:8000
  timeout: 10000,
});

// Request interceptor: Add auth token
api.interceptors.request.use((config) => {
  const token = AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: ✅ Extract error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.message || error.detail || "Request failed";
    return Promise.reject({ ...error, message });
  }
);
```

### authApi.js (Authentication Services)

```javascript
export const authApi = {
  // Send OTP
  sendOtp: async (phone) => {
    return api.post('/api/auth/otp', { phone });
  },

  // Verify OTP
  verifyOtp: async (phone, otp) => {
    return api.post('/api/auth/verify', { phone, otp });
  },

  // Check if phone exists (NEW)
  checkPhoneExists: async (phone) => {
    return api.post('/api/auth/check-phone', { phone });
  },

  // Register farmer
  register: async (farmerData) => {
    return api.post('/api/auth/register', farmerData);
  },
};
```

### API Calls Pattern

**Example: Get Recommendations**
```javascript
try {
  const response = await mlAPI.getRecommendations({ farm_id: farmId });
  
  // ✅ Check for success flag
  if (response.data.recommendations) {
    setRecommendations(response.data.recommendations);
  } else {
    // Fall back to demo crops if no recommendations
    setRecommendations(DEMO_CROPS);
  }
} catch (error) {
  // Better error handling
  const msg = error.message || "Failed to get recommendations";
  Alert.alert("Error", msg);
  setRecommendations(DEMO_CROPS);
}
```

---

## 🎯 State Management

### AsyncStorage (Persistent Storage)

```javascript
// Auth & User Data
'auth_token'       // JWT token
'farmer_id'        // Unique farmer identifier
'farmer_phone'     // Phone number
'farm_state'       // State
'farm_district'    // District

// Farm Data
'farm_id'          // Unique farm identifier (format: FARM_xxx_timestamp)
'farm_details'     // Stringified farm object

// UI State
'selected_language' // Language preference
'selected_crop'     // Currently selected crop
```

### Context API (Global State)

```javascript
// LanguageContext.js
const LanguageContext = createContext();

// Provides:
export const useLanguage = () => {
  const { language, setLanguage, t } = useContext(LanguageContext);
  return { language, setLanguage, t };
};

// Usage:
const { t } = useLanguage();
// <Text>{t('welcome')}</Text>
```

### Component-Level State

```javascript
// HomeScreen.js
const [farmDetails, setFarmDetails] = useState(null);
const [recommendations, setRecommendations] = useState([]);
const [loading, setLoading] = useState(false);
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- npm 9+
- Expo CLI: `npm install -g expo-cli`
- Backend running on localhost:8000

### Setup

```bash
cd app_build/frontend

# Install dependencies
npm install

# Start development server
npx expo start
```

### Test the App

**Option A: On your phone**
```bash
# Scan QR code with camera
# Open with Expo Go app
```

**Option B: Web browser**
```bash
# In terminal, press: w
# Opens at http://localhost:19000
```

**Option C: Android Emulator**
```bash
# Press: a
# Requires Android Studio + emulator
```

### Update API URL

If backend is on different machine:

**File:** `frontend/src/constants/api.js`
```javascript
// OLD
const BASE_URL = 'http://127.0.0.1:8000';

// NEW (find your IP with `ipconfig`)
const BASE_URL = 'http://192.168.1.100:8000';
```

---

## 🛠️ Development Guide

### Adding a New Screen

**Step 1:** Create screen file
```javascript
// src/screens/MyNewScreen.js
import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';

export default function MyNewScreen({ navigation }) {
  const [data, setData] = useState(null);

  return (
    <View style={styles.container}>
      <Text>My New Screen</Text>
      <Button title="Next" onPress={() => navigation.navigate('NextScreen')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
});
```

**Step 2:** Add to navigation
```javascript
// src/navigation/AppNavigator.js
import MyNewScreen from '../screens/MyNewScreen';

const MainTabs = () => (
  <Tab.Navigator>
    {/* ... other screens ... */}
    <Tab.Screen name="MyTab" component={MyNewScreen} />
  </Tab.Navigator>
);
```

**Step 3:** Use navigation
```javascript
<Button 
  title="Go to My Screen"
  onPress={() => navigation.navigate('MyTab')}
/>
```

### Adding a New API Call

**Step 1:** Add to appropriate API service
```javascript
// src/services/mlApi.js
export const mlAPI = {
  // ... existing methods ...
  
  // NEW METHOD
  getPlantingGuide: async (cropName) => {
    return api.get(`/api/ml/guide/${cropName}`);
  },
};
```

**Step 2:** Use in component
```javascript
useEffect(() => {
  const fetchGuide = async () => {
    try {
      const response = await mlAPI.getPlantingGuide('tulsi');
      setGuide(response.data);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };
  fetchGuide();
}, []);
```

### Styling Components

```javascript
// Use theme constants
import { COLORS, FONTS, SPACING } from '../constants/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.medium,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: FONTS.title,
    color: COLORS.text,
    marginBottom: SPACING.large,
  },
});
```

---

## 📋 Common Tasks

### Task 1: Display a Loading Spinner
```javascript
import { ActivityIndicator } from 'react-native';

{loading && <ActivityIndicator size="large" color="#2ecc71" />}
```

### Task 2: Show an Alert
```javascript
import { Alert } from 'react-native';

Alert.alert(
  'Title',
  'Message',
  [
    { text: 'Cancel', onPress: () => {} },
    { text: 'OK', onPress: () => handleOK() },
  ]
);
```

### Task 3: Persist Data
```javascript
// Save
await AsyncStorage.setItem('my_key', JSON.stringify(data));

// Retrieve
const data = await AsyncStorage.getItem('my_key');
const parsed = JSON.parse(data);

// Delete
await AsyncStorage.removeItem('my_key');
```

### Task 4: Navigate with Parameters
```javascript
// Navigate with data
navigation.navigate('DetailScreen', { itemId: 123 });

// Receive in new screen
const MyScreen = ({ route }) => {
  const { itemId } = route.params;
};
```

---

## 🐛 Troubleshooting

### "API connection refused"
```bash
# Make sure backend is running
# Check localhost:8000/docs

# Update API URL in constants/api.js
# Verify backend IP if on different machine
```

### "Module not found"
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install

# Also try:
npx expo start --clear
```

### "OTP not working"
```bash
# Twilio not configured?
# Check backend .env file

# Test mode OTP is: 123456
# Check backend logs for actual OTP sent
```

### "Farm recommendations not loading"
**Causes:**
- ✅ farm_id is "FARM_ANON" → Not saved properly
- ✅ farmer_id is missing → Needs to be stored
- API call using wrong method name → **FIXED** (was calling recommendAPI)

**Fix:**
```javascript
// Make sure farm is saved first
await api.post('/api/farm/save', farmData);

// Then get recommendations
const result = await mlAPI.getRecommendations({ farm_id });
```

### "Blank screen or crash"
```bash
# Check logs:
npx expo start --verbose

# Clear cache:
npx expo start --clear

# Restart everything:
# Stop server (Ctrl+C)
# Kill node processes
# Start fresh
```

---

## 🎯 Best Practices

✅ **Do:**
- Use AsyncStorage for auth tokens (secure storage)
- Show loading indicators during API calls
- Display error messages to user
- Validate input before sending to backend
- Handle null/undefined gracefully

❌ **Don't:**
- Store sensitive data in plain text
- Make API calls in render function (use useEffect)
- Ignore error responses
- Mix AsyncStorage with Redux (use one pattern)
- Hardcode colors/fonts (use constants)

---

## 📚 Related Documentation

- [ARCHITECTURE.md](../ARCHITECTURE.md) — System design
- [backend/README.md](./backend/README.md) — API endpoints
- [GETTING_STARTED.md](../GETTING_STARTED.md) — Setup guide

---

*Mobile App Documentation | Last Updated: May 2026*
