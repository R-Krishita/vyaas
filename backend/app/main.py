# app/main.py
# Smart Ayurvedic Crop Advisor - FastAPI Backend
# Main application entry point with real Mandi API integration

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import market_router
from app.config import get_settings

# Initialize FastAPI app
app = FastAPI(
    title="Smart Ayurvedic Crop Advisor API",
    description="""
    🌿 Backend API for the Smart Ayurvedic Crop Advisor mobile app.
    
    ## Features
    - **Real-time Mandi Prices**: Live market prices from data.gov.in (Agmarknet)
    - **Ayurvedic Crop Focus**: Tulsi, Ashwagandha, Turmeric, and more
    - **Best Mandi Finder**: Find where to sell at best prices
    - **Price History**: Trend analysis for informed decisions
    
    ## Data Source
    Prices fetched from Government of India's Agmarknet database via data.gov.in API.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware for mobile app access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(market_router)


@app.get("/")
async def root():
    """Root endpoint with API info."""
    return {
        "app": "Smart Ayurvedic Crop Advisor",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "endpoints": {
            "market_prices": "/api/market/prices?crop=tulsi",
            "price_history": "/api/market/prices/history?crop=turmeric",
            "best_mandis": "/api/market/best-mandis?crop=ashwagandha",
            "supported_crops": "/api/market/supported-crops"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    settings = get_settings()
    return {
        "status": "healthy",
        "api_key_configured": bool(settings.data_gov_api_key and settings.data_gov_api_key != "your_api_key_here"),
        "data_source": "data.gov.in"
    }


# Placeholder endpoints for future features
from pydantic import BaseModel

class OTPRequest(BaseModel):
    phone: str

class OTPVerifyRequest(BaseModel):
    phone: str
    otp: str

@app.post("/api/auth/otp")
async def send_otp(request: OTPRequest):
    """Send OTP for login (placeholder)."""
    return {"success": True, "message": "OTP sent", "phone": request.phone}


@app.post("/api/auth/verify")
async def verify_otp(request: OTPVerifyRequest):
    """Verify OTP (placeholder)."""
    return {"success": True, "token": "placeholder_jwt_token", "farmer_id": "F001"}


@app.post("/api/farm/save")
async def save_farm_details(farm_data: dict):
    """Save farm details (placeholder)."""
    return {"success": True, "farm_id": "FARM_001", "message": "Farm details saved"}


@app.post("/api/ml/recommend")
async def get_crop_recommendations(request: dict):
    """Get crop recommendations (placeholder - connect ML model later)."""
    return {
        "recommendations": [
            {
                "rank": 1,
                "crop_name": "Tulsi",
                "match_score": 92,
                "profit_estimate": 45000,
                "reasons": ["Suitable for your soil", "Low water needs", "Good market price"]
            },
            {
                "rank": 2,
                "crop_name": "Ashwagandha", 
                "match_score": 85,
                "profit_estimate": 38000,
                "reasons": ["High demand", "Drought tolerant"]
            },
            {
                "rank": 3,
                "crop_name": "Turmeric",
                "match_score": 78,
                "profit_estimate": 32000,
                "reasons": ["Traditional crop", "Easy cultivation"]
            }
        ]
    }


class ChatbotRequest(BaseModel):
    message: str
    farmer_id: str = None
    context: str = None

@app.post("/api/chatbot/ask")
async def chatbot_ask(request: ChatbotRequest):
    """Chatbot endpoint (placeholder - connect LLM later)."""
    return {
        "reply": "I'm your Ayurvedic crop assistant! This is a placeholder response. Connect an LLM API for real answers.",
        "quick_replies": ["Pest help", "Watering tips", "Market prices"]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
