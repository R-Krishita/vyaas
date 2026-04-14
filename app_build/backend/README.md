# Smart Ayurvedic Crop Advisor - Backend

FastAPI backend with real Mandi API integration and AI-powered chatbot for agricultural assistance.

## How It Works

The backend is built with **FastAPI** and serves as the brain of the Vyaas application. It integrates multiple services:

1.  **AI & ML Core**:
    - **Crop Recommendation**: Uses a Random Forest Classifier trained on soil and climate data to predict the best suitable crops.
    - **Chatbot**: Powered by **Google Gemini AI**, providing context-aware agricultural advice in local languages.

2.  **Real-Time Market Data**:
    - Connects to the **Government of India's Agmarknet API** (via data.gov.in) to fetch live Mandi prices for Ayurvedic crops.
    - Provides price history and trend analysis to help farmers decide when and where to sell.

3.  **Modern API Architecture**:
    - **Fast & Async**: Built on FastAPI for high performance.
    - **Swagger/OpenAPI**: Automatic interactive documentation for easy testing.

## Features

- **Real-time Market Prices**: Live mandi prices from data.gov.in (Agmarknet)
- **AI Chatbot**: Gemini-powered agricultural assistant for crop advice
- **Ayurvedic Crop Focus**: Tulsi, Ashwagandha, Turmeric, Ginger, and more
- **Smart Recommendations**: ML-based crop suggestions tailored to specific farm conditions

## Setup & Quick Start

### 1. Prerequisites

- Python 3.9+
- A virtual environment (recommended)

### 2. Installation

```bash
# Navigate to backend folder
cd backend

# Create and activate virtual environment
# Windows:
python -m venv .venv
.\.venv\Scripts\activate

# Linux/Mac:
# python3 -m venv .venv
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Start the Server

Run the following command to start the backend server on **port 8000**:

```bash
uvicorn app.main:app --reload
```

_The `--reload` flag enables auto-restart on code changes._

**Verify it's running:**
Open [http://localhost:8000](http://localhost:8000) or check the docs at [http://localhost:8000/docs](http://localhost:8000/docs).

## Environment Variables

Create a `.env` file (see `.env.example`):

```env
DATA_GOV_API_KEY=your_data_gov_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### Getting API Keys

- **DATA_GOV_API_KEY**: Get your free key from [data.gov.in](https://data.gov.in/)
- **GEMINI_API_KEY**: Get your free key from [Google AI Studio](https://aistudio.google.com/app/apikey)

## API Endpoints

> 📖 **Interactive Docs**: http://localhost:8000/docs (Swagger UI)

---

### 🔐 Authentication

| Method | Endpoint           | Description              |
| ------ | ------------------ | ------------------------ |
| `POST` | `/api/auth/otp`    | Send OTP to phone number |
| `POST` | `/api/auth/verify` | Verify OTP and get token |

**POST /api/auth/otp**

```json
// Request
{ "phone": "+919876543210" }

// Response
{ "success": true, "message": "OTP sent", "phone": "+919876543210" }
```

---

### 🚜 Farm Management

| Method | Endpoint         | Description       |
| ------ | ---------------- | ----------------- |
| `POST` | `/api/farm/save` | Save farm details |

**POST /api/farm/save**

```json
// Request
{
  "state": "Maharashtra",
  "district": "Pune",
  "farmSize": "2.5",
  "soilType": "Black",
  "soilPh": "6.5",
  "nitrogen": "80",
  "phosphorus": "40",
  "potassium": "45",
  "rainfall": "800",
  "temperature": "28",
  "waterSource": "Well",
  "irrigationType": "Drip",
  "season": "Kharif",
  "budget": "50000",
  "humidity": "65",
  "farm_id": "FARM_001"
}

// Response
{ "status": "success", "data": { ... } }
```

---

### 🌾 ML Crop Recommendations

| Method | Endpoint            | Description                    |
| ------ | ------------------- | ------------------------------ |
| `POST` | `/api/ml/recommend` | Get top 3 crop recommendations |

**POST /api/ml/recommend**

```json
// Request
{ "farm_id": "FARM_001" }

// Response
{
  "recommendations": [
    {
      "rank": 1,
      "crop_name": "Tulsi",
      "crop_name_hi": "Tulsi",
      "match_score": 92.5,
      "profit_estimate": 48000,
      "reasons": ["Suitable for your soil", "Good market potential"],
      "icon": "[plant]"
    },
    ...
  ]
}
```

---

### 📊 Market Prices (data.gov.in)

| Method | Endpoint                      | Description               |
| ------ | ----------------------------- | ------------------------- |
| `GET`  | `/api/market/prices`          | Get current market prices |
| `GET`  | `/api/market/prices/history`  | Get price history/trends  |
| `GET`  | `/api/market/best-mandis`     | Find best mandis to sell  |
| `GET`  | `/api/market/supported-crops` | List all supported crops  |

**GET /api/market/prices**

```
/api/market/prices?crop=tulsi&state=Maharashtra&district=Pune
```

**GET /api/market/prices/history**

```
/api/market/prices/history?crop=turmeric&days=30
```

**GET /api/market/best-mandis**

```
/api/market/best-mandis?crop=ashwagandha&state=Maharashtra
```

**GET /api/market/supported-crops**

```json
// Response
{ "crops": ["tulsi", "ashwagandha", "turmeric", "ginger", ...] }
```

---

### 🤖 AI Chatbot (Gemini)

| Method | Endpoint              | Description          |
| ------ | --------------------- | -------------------- |
| `POST` | `/api/chatbot/ask`    | Ask the AI assistant |
| `GET`  | `/api/chatbot/health` | Check chatbot status |

**POST /api/chatbot/ask**

```json
// Request
{
  "message": "When should I plant tulsi?",
  "farmer_id": "F001",
  "context": null
}

// Response
{
  "response": "Tulsi is best planted during...",
  "suggestions": ["What soil is best?", "Water requirements?"]
}
```

---

### 🏥 Health Check

| Method | Endpoint  | Description                     |
| ------ | --------- | ------------------------------- |
| `GET`  | `/`       | API info and status             |
| `GET`  | `/health` | Health check with config status |

---

## Quick Start

```bash
# Start the server (from backend folder)
uvicorn app.main:app --reload

# Test an endpoint
curl http://localhost:8000/api/market/supported-crops
```
