# Smart Ayurvedic Crop Advisor - Backend

FastAPI backend with real Mandi API integration for agricultural market prices.

## Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Environment Variables

Create a `.env` file:
```
DATA_GOV_API_KEY=your_api_key_here
```

Get your free API key from: https://data.gov.in/
