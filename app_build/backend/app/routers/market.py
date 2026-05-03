# app/routers/market.py
# Market/Mandi API routes for fetching agricultural commodity prices

from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional
from app.config import get_settings, Settings
from app.services.mandi_service import MandiService

router = APIRouter(prefix="/api/market", tags=["Market Prices"])


_mandi_service_instance = None

def get_mandi_service(settings: Settings = Depends(get_settings)) -> MandiService:
    """Dependency to get MandiService instance."""
    global _mandi_service_instance
    if _mandi_service_instance is None:
        _mandi_service_instance = MandiService(
            api_key=settings.data_gov_api_key,
            resource_id=settings.mandi_resource_id,
            base_url=settings.data_gov_base_url
        )
    return _mandi_service_instance


@router.get("/prices")
async def get_market_prices(
    crop: str = Query(..., description="Crop name (e.g., tulsi, turmeric, ashwagandha)"),
    state: Optional[str] = Query(None, description="State filter (e.g., Maharashtra)"),
    district: Optional[str] = Query(None, description="District filter (e.g., Pune)"),
    limit: int = Query(10, ge=1, le=50, description="Number of mandis to fetch"),
    mandi_service: MandiService = Depends(get_mandi_service)
):
    """Get real-time mandi prices for Ayurvedic/medicinal crops."""
    prices = await mandi_service.get_mandi_prices(
        crop=crop,
        state=state,
        district=district,
        limit=limit
    )
    return prices


@router.get("/prices/history")
async def get_price_history(
    crop: str = Query(..., description="Crop name"),
    days: int = Query(30, ge=7, le=90, description="Number of days for history"),
    mandi_service: MandiService = Depends(get_mandi_service)
):
    """Get price history for trend analysis."""
    history = await mandi_service.get_price_history(crop=crop, days=days)
    return history


@router.get("/predict-harvest")
async def predict_harvest_price(
    crop: str = Query(..., description="Crop name"),
    growth_days: int = Query(120, description="Growth duration in days"),
    current_price: float = Query(..., description="Current market price"),
    mandi_service: MandiService = Depends(get_mandi_service)
):
    """Predicts market price at harvest time based on current trends."""
    prediction = mandi_service.predict_harvest_price(
        crop=crop, 
        growth_days=growth_days, 
        current_price=current_price
    )
    return prediction


@router.get("/supported-crops")
async def get_supported_crops(settings: Settings = Depends(get_settings)):
    """Get list of supported Ayurvedic crops."""
    return {
        "supported_crops": settings.supported_crops,
        "note": "These are Ayurvedic/medicinal crops tracked by our system"
    }


@router.get("/best-mandis")
async def get_best_mandis(
    crop: str = Query(..., description="Crop name"),
    state: Optional[str] = Query(None, description="State filter"),
    mandi_service: MandiService = Depends(get_mandi_service)
):
    """Get top 5 mandis with best prices for a crop."""
    prices = await mandi_service.get_mandi_prices(
        crop=crop,
        state=state,
        limit=20
    )
    
    if prices.get("success"):
        return {
            "crop": crop,
            "best_mandis": prices.get("nearby_mandis", [])[:5],
            "recommendation": prices.get("best_mandi"),
            "average_price": prices.get("current_price_avg")
        }
    return prices
