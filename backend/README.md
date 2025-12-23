# Smart Ayurvedic Crop Advisor - Backend

FastAPI backend with real Mandi API integration and AI-powered chatbot for agricultural assistance.

## Features

- **Real-time Market Prices**: Live mandi prices from data.gov.in (Agmarknet)
- **AI Chatbot**: Gemini-powered agricultural assistant for crop advice
- **Ayurvedic Crop Focus**: Tulsi, Ashwagandha, Turmeric, Ginger, and more

## Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

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

| Endpoint | Description |
|----------|-------------|
| `GET /api/market/prices?crop=tulsi` | Get market prices for a crop |
| `GET /api/market/best-mandis?crop=turmeric` | Find best selling locations |
| `GET /api/market/supported-crops` | List all supported crops |
| `POST /api/chatbot/ask` | Ask the AI chatbot |
| `GET /api/chatbot/health` | Check chatbot configuration |
| `GET /docs` | Swagger API documentation |
