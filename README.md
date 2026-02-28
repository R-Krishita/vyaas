# 🌿 Vyaas — Smart Ayurvedic Crop Advisor

**Vyaas** is an AI-powered agricultural platform that helps Indian farmers choose the best ayurvedic crops for their land. It combines a **machine learning engine** trained on 60+ crops with **real-time market prices** and **AI-powered chat assistance** to deliver personalized recommendations — with a special focus on high-value Ayurvedic crops like Tulsi, Ashwagandha, and Turmeric.

---

## 📸 Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                      Farmer (User)                       │
│                           │                              │
│                    ┌──────▼──────┐                       │
│                    │  Mobile App │  (Expo / React Native) │
│                    └──────┬──────┘                       │
│                           │ REST API                     │
│                    ┌──────▼──────┐                       │
│                    │   Backend   │  (FastAPI / Python)    │
│                    └──┬────┬──┬──┘                       │
│            ┌──────────┘    │  └──────────┐               │
│     ┌──────▼──────┐ ┌─────▼─────┐ ┌─────▼──────┐       │
│     │  ML Model   │ │ Agmarknet │ │ Gemini AI  │       │
│     │(RandomForest)│ │(Mkt Prices)│ │ (Chatbot)  │       │
│     └─────────────┘ └───────────┘ └────────────┘       │
└──────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
vyaas/
│
├── 📂 backend/                        # FastAPI Backend Server
│   ├── 📂 app/
│   │   ├── 📂 routers/
│   │   │   ├── auth.py                  # OTP authentication endpoints
│   │   │   ├── farm_router.py           # Farm CRUD endpoints
│   │   │   ├── market.py               # Market price endpoints
│   │   │   └── ml_router.py            # ML prediction endpoint
│   │   ├── 📂 services/
│   │   │   ├── auth_service.py          # Twilio OTP logic
│   │   │   ├── farm_service.py          # Farm data management
│   │   │   ├── mandi_service.py         # Agmarknet price fetcher
│   │   │   └── recommendation_service.py # ML model loader & predictor
│   │   ├── config.py                    # App settings & env vars
│   │   └── main.py                      # FastAPI app entry point
│   ├── .env.example                     # Environment variable template
│   ├── requirements.txt                 # Python dependencies
│   └── README.md                        # Backend-specific docs
│
├── 📂 mobile-app/                     # Expo + React Native Mobile App
│   ├── 📂 src/
│   │   ├── 📂 components/
│   │   │   └── HeroCarousel.js          # Home screen carousel
│   │   ├── 📂 constants/
│   │   │   ├── api.js                   # API base URL config
│   │   │   ├── theme.js                 # Colors, fonts, spacing tokens
│   │   │   └── translations.js          # Multi-language strings
│   │   ├── 📂 context/
│   │   │   └── LanguageContext.js       # Language state provider
│   │   ├── 📂 navigation/
│   │   │   └── AppNavigator.js          # Auth stack + Tab navigator
│   │   ├── 📂 screens/
│   │   │   ├── SplashScreen.js          # App splash/loading
│   │   │   ├── LanguageScreen.js        # Language selection
│   │   │   ├── WelcomeScreen.js         # Onboarding welcome
│   │   │   ├── OTPLoginScreen.js        # Phone number input
│   │   │   ├── OTPVerificationScreen.js # OTP code verification
│   │   │   ├── HomeScreen.js            # Main dashboard
│   │   │   ├── FarmDetailsScreen.js     # Farm details form (3 steps)
│   │   │   ├── RecommendationsScreen.js # ML crop recommendations
│   │   │   ├── CultivationPlanScreen.js # Crop cultivation plan
│   │   │   ├── MarketInsightsScreen.js  # Market prices & trends
│   │   │   └── ProfileScreen.js         # User profile & settings
│   │   ├── 📂 services/
│   │   │   ├── api.js                   # Axios API client
│   │   │   └── authApi.js               # Auth API calls
│   │   └── 📂 styles/
│   │       └── style.js                 # Shared/global styles
│   ├── App.js                           # App root component
│   ├── app.json                         # Expo configuration
│   └── package.json                     # Node dependencies
│
├── 📂 dataset/                        # ML Training Pipeline
│   ├── crop_master.csv                  # Base crop info (60 crops)
│   ├── crop_soil_requirements.csv       # Ideal soil params per crop
│   ├── crop_climate_requirements.csv    # Ideal climate params per crop
│   ├── crop_economics.csv               # Budget & yield data per crop
│   ├── crops_merged.csv                 # All tables merged
│   ├── farmer_inputs.csv                # Generated synthetic dataset (~500k rows)
│   ├── generate_farmer_inputs.py        # Synthetic data generator script
│   ├── train_crop_model.py              # Random Forest training script
│   ├── remerge_crops.py                 # CSV re-merge utility
│   ├── crop_recommendation_model.pkl    # Trained model artifact
│   ├── label_encoders.pkl               # Categorical encoders
│   └── README.md                        # Dataset documentation
│
├── 📂 admin-panel/                    # Admin Dashboard (WIP)
│   ├── 📂 src/
│   │   ├── 📂 components/
│   │   │   └── Chatbot.jsx              # AI chatbot widget
│   │   ├── 📂 pages/
│   │   │   ├── Dashboard.jsx            # Admin overview dashboard
│   │   │   ├── CropsDatabase.jsx        # Crop database manager
│   │   │   └── FarmerRecords.jsx        # Farmer records viewer
│   │   ├── App.jsx                      # App root with routing
│   │   ├── main.jsx                     # Vite entry point
│   │   └── index.css                    # Global styles
│   ├── index.html                       # HTML template
│   ├── vite.config.js                   # Vite config
│   └── package.json                     # Node dependencies
│
├── documentation.md                     # Detailed internal project docs
├── vercel.json                          # Vercel deployment config
├── .gitignore                           # Git ignore rules
└── README.md                            # ← You are here
```

---

## ✅ Prerequisites

Make sure you have the following installed before proceeding:

| Tool                   | Version | Download                                                                                                                                    |
| :--------------------- | :------ | :------------------------------------------------------------------------------------------------------------------------------------------ |
| **Node.js**            | ≥ 18.x  | [nodejs.org](https://nodejs.org/)                                                                                                           |
| **npm**                | ≥ 9.x   | Comes with Node.js                                                                                                                          |
| **Python**             | ≥ 3.9   | [python.org](https://www.python.org/downloads/)                                                                                             |
| **Git**                | Any     | [git-scm.com](https://git-scm.com/)                                                                                                         |
| **Expo Go** (optional) | Latest  | [App Store](https://apps.apple.com/app/expo-go/id982107779) / [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) |

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/R-Krishita/vyaas.git
cd vyaas
```

---

### 2. Backend Setup (`/backend`)

The backend is a **FastAPI** server that serves the ML model, market prices.

#### a) Create & activate a virtual environment

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate it
# Windows (PowerShell):
.\.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate
```

#### b) Install Python dependencies

```bash
pip install -r requirements.txt
```

#### c) Configure environment variables

Copy the example env file and fill in your API keys:

```bash
cp .env.example .env
```

Open `.env` and add your keys:

```env
# Get from https://data.gov.in/
DATA_GOV_API_KEY=your_key_here

# Get from https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_key_here
```

#### d) Start the backend server

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at **http://localhost:8000**. Visit http://localhost:8000/docs for the interactive Swagger UI.

---

### 3. Mobile App Setup (`/mobile-app`)

The mobile app is built with **React Native** using **Expo**.

#### a) Install dependencies

```bash
cd mobile-app
npm install
```

#### b) Start the development server

```bash
npx expo start
```

This will show a QR code in the terminal. You can:

- **Phone**: Scan the QR code with the **Expo Go** app (iOS/Android)
- **Web**: Press `w` to open in the browser
- **Emulator**: Press `a` for Android emulator

> **💡 Tip**: If the app can't reach the backend, update the API base URL in `mobile-app/src/services/api.js` to point to your machine's local IP address (e.g., `http://192.168.x.x:8000`).

---

### 4. ML Pipeline (`/dataset`) — Optional

This is only needed if you want to **retrain** the crop recommendation model.

```bash
cd dataset

# Step 1: Generate synthetic farmer inputs (~500k rows)
python generate_farmer_inputs.py

# Step 2: Train the Random Forest model
python train_crop_model.py
```

After training, two artifact files are produced:

- `crop_recommendation_model.pkl` — the trained model
- `label_encoders.pkl` — encoders for categorical features

These are loaded automatically by the backend at startup.

---

### 5. Admin Panel (`/admin-panel`) — Work In Progress

```bash
cd admin-panel
npm install
npm run dev
```

---

## 🔑 API Keys Required

| Key                | Purpose                       | Where to Get                                        |
| :----------------- | :---------------------------- | :-------------------------------------------------- |
| `DATA_GOV_API_KEY` | Fetch real-time market prices | [data.gov.in](https://data.gov.in/)                 |
| `GEMINI_API_KEY`   | AI chatbot for farmer queries | [AI Studio](https://aistudio.google.com/app/apikey) |

---

## 🛠️ Tech Stack

| Layer       | Technology                           |
| :---------- | :----------------------------------- |
| Mobile App  | React Native, Expo, React Navigation |
| Backend     | FastAPI, Uvicorn, Python             |
| ML Model    | scikit-learn (Random Forest)         |
| Database    | In-memory / CSV (current phase)      |
| Auth        | Twilio OTP                           |
| Market Data | Agmarknet (data.gov.in)              |
| AI Chat     | Google Gemini                        |
| Admin Panel | Vite, React                          |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m "Add my feature"`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## 📄 License

This project is developed as an academic/research initiative. Please contact the maintainers for licensing details.
