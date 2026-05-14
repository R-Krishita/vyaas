# 🌿 Vyaas — Smart Ayurvedic Crop Advisor

> 🚀 **An AI-powered platform helping Indian farmers cultivate high-value Ayurvedic crops with data-driven decisions.**

**Vyaas** helps farmers choose the best ayurvedic crops for their land using ML recommendations, real-time market prices, and AI chat assistance. We combine a **Random Forest model trained on 60+ crops**, **live Agmarknet price data**, and **Google Gemini AI** to deliver personalized crop recommendations focused on high-value crops like Tulsi, Ashwagandha, and Turmeric.

**Quick Links:** 📖 [Getting Started](../GETTING_STARTED.md) | 🏗️ [Architecture](../ARCHITECTURE.md) | 💬 [Troubleshooting](#-troubleshooting) | ❓ [FAQ](#-faqs)

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

## ⚡ Key Features

- 🌱 **Smart Crop Recommendations** — ML model suggests optimal crops based on farm soil, climate, and economics
- 💰 **Real-Time Market Prices** — Live price data from Agmarknet updated daily
- 💬 **AI-Powered Chatbot** — Gemini AI answers farmer queries in multiple languages
- 📊 **Market Insights** — Price trends, harvest timing, and economic analysis
- 🔐 **Secure OTP Authentication** — Phone-based login without passwords
- 📱 **Mobile-First Design** — Works on any Android/iOS device via Expo
- 🌍 **Multi-Language Support** — Hindi, English, and regional languages

---

## 🚀 Quick Start (5 minutes)

```bash
# 1. Clone repo
git clone https://github.com/R-Krishita/vyaas.git
cd vyaas

# 2. Start Backend (requires Python 3.9+)
cd app_build/backend
python -m venv .venv
# Windows: .\.venv\Scripts\activate | macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000

# 3. Start Frontend (in another terminal, requires Node 18+)
cd app_build/frontend
npm install
npx expo start
# Scan QR code with Expo Go app or press 'w' for web
```

> **First time?** See [Getting Started Guide](../GETTING_STARTED.md) for detailed step-by-step instructions.

---

## 🚀 Full Setup (Following Guide)

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
cd app_build/backend

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
after starting the virtual python environment run this command
```bash
python -m uvicorn app.main:app --reload --port 8000
```

The API will be available at **http://localhost:8000**. Visit http://localhost:8000/docs for the interactive Swagger UI.

---

### 3. Mobile App Setup (`/mobile-app`)

The mobile app is built with **React Native** using **Expo**.

#### a) Install dependencies

```bash
cd app_build/frontend
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

---

## ❓ FAQs

**Q: Can I run the backend on Windows?**
A: Yes! Use Python's venv module. For activation, use `.\.venv\Scripts\activate` (PowerShell) or `.\.venv\Scripts\activate.bat` (CMD).

**Q: Why does the mobile app show "Connection refused" error?**
A: Update the API base URL in `frontend/src/constants/api.js` to your machine's local IP (e.g., `http://192.168.1.5:8000`). Don't use `localhost` — the phone can't reach it.

**Q: How do I get API keys?**
A: 
- **Data.gov (Agmarknet)**: Sign up at [data.gov.in](https://data.gov.in/), create an app, copy your API key
- **Google Gemini**: Get free key at [AI Studio](https://aistudio.google.com/app/apikey)

**Q: What if I get "ModuleNotFoundError: No module named 'fastapi'"?**
A: Make sure you activated the Python virtual environment before running `pip install -r requirements.txt`.

**Q: Does the app work offline?**
A: No. It needs internet for Agmarknet prices, Gemini AI chat, and OTP verification. Recommendations can work with cached data.

**Q: How often is the ML model retrained?**
A: Currently, it's retrained manually in the dataset/ folder. Automated retraining is on the roadmap.

**Q: Can I deploy this to production?**
A: Backend can deploy to Heroku/Railway. Frontend deploys via Expo Application Services (EAS). See deployment guides in documentation.md.

---

## 🛠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| **Port 8000 already in use** | Change to another port: `python -m uvicorn app.main:app --port 8001` |
| **npm install fails** | Clear cache: `npm cache clean --force && npm install` |
| **API shows 422 Unprocessable Entity** | Check .env file has all required keys: `DATA_GOV_API_KEY`, `GEMINI_API_KEY` |
| **OTP never arrives** | Verify Twilio credentials in .env; check phone number format (must be +91XXXXXXXXXX) |
| **Backend starts but API unreachable from phone** | Phone and PC must be on same WiFi; update API URL to PC's local IP, not localhost |
| **Frontend screen is blank** | Check browser console (web) or Expo logs for errors; restart with `npx expo start --clear` |
| **Dataset is too large to process** | Generate fewer rows in `dataset/generate_farmer_inputs.py` (adjust `num_rows` parameter) |

📖 **Need help?** Check [Getting Started Guide](../GETTING_STARTED.md#-troubleshooting-common-issues) for more detailed troubleshooting steps.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m "Add my feature"`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

**Code Style:** Follow PEP 8 (Python), Prettier (JavaScript). Add tests for new features.

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [GETTING_STARTED.md](../GETTING_STARTED.md) | Step-by-step setup guide for all components |
| [ARCHITECTURE.md](../ARCHITECTURE.md) | System design, data flows, authentication, database schema |
| [documentation.md](./documentation.md) | Detailed internal architecture and API reference |
| [backend/README.md](./backend/README.md) | Backend-specific setup and API endpoints |
| [dataset/README.md](./dataset/README.md) | ML model training and data pipeline |

---

## 📞 Support & Contact

- **Issues?** Open a GitHub issue or check Troubleshooting above
- **Questions?** See FAQ section
- **Contributions?** Pull requests welcome! See Contributing guidelines
- **Maintainers:** Check the GitHub repository for contact info

---

## 📄 License

This project is developed as an academic/research initiative. Please contact the maintainers for licensing details.

---

**Last Updated:** May 2024 | Built with ❤️ for Indian farmers
