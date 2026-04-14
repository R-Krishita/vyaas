# app/main.py
# Smart Ayurvedic Crop Advisor - FastAPI Backend
# Main application entry point with real Mandi API integration

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import market_router, farm_router, ml_router
from app.routers.auth import router as auth_router
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
app.include_router(farm_router.router)
app.include_router(ml_router.router)
app.include_router(auth_router)


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





if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
