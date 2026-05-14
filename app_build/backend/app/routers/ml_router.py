# app/routers/ml_router.py
# ML crop recommendation and feedback endpoints

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List
from app.services.recommendation_service import RecommendationService
from app.services.farm_service import farm_service

router = APIRouter(prefix="/api/ml", tags=["Machine Learning"])
recommender = RecommendationService()


# ── Request / Response models ─────────────────────────────────────────────────

class RecommendRequest(BaseModel):
    farm_id: str


class FeedbackRequest(BaseModel):
    farmer_id: str
    farm_id: str
    recommended_crops: List[str]
    chosen_crop: str


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/recommend")
async def get_recommendations(request: RecommendRequest):
    """Get ML crop recommendations for a saved farm_id."""
    farm_data = farm_service.get_farm_details(request.farm_id)

    if not farm_data:
        print(f"\n[ML ENGINE] ❌ No farm data found for farm_id='{request.farm_id}'")
        return {"recommendations": [], "status": "no_data",
                "message": "Farm details not found. Please submit farm data first."}

    # ── Terminal log ──────────────────────────────────────────────────────────
    print("\n" + "=" * 55)
    print(f"[ML ENGINE] 🌾 Predicting crops for farm_id='{request.farm_id}'")
    print("-" * 55)
    print(f"  📍 State          : {farm_data.get('state', '')} / {farm_data.get('district', '')}")
    print(f"  📐 Farm Size      : {farm_data.get('farmSize', farm_data.get('total_farm_size_acres', '?'))} acres")
    print(f"  🌡️  Temperature    : {farm_data.get('temperature', 0)} °C")
    print(f"  🌧️  Rainfall       : {farm_data.get('rainfall', 0)} mm")
    print(f"  💧 Humidity       : {farm_data.get('humidity', 0)} %")
    print(f"  🪨  Soil Type      : {farm_data.get('soilType', farm_data.get('soil_type', 'N/A'))}")
    print(f"  🧪 Soil pH        : {farm_data.get('soilPh', farm_data.get('ph', 6.5))}")
    print(f"  💧 Soil Moisture  : {farm_data.get('soilMoisture', farm_data.get('soil_moisture', 0))} %")
    print(f"  🍂 Organic Carbon : {farm_data.get('organicCarbon', farm_data.get('organic_carbon', 0))} %")
    print(f"  🌿 Nitrogen       : {farm_data.get('nitrogen', 0)} kg/ha")
    print(f"  🧬 Phosphorus     : {farm_data.get('phosphorus', 0)} kg/ha")
    print(f"  ⚗️  Potassium      : {farm_data.get('potassium', 0)} kg/ha")
    print(f"  💰 Budget         : ₹{farm_data.get('budget', 0)}")
    print("-" * 55)

    recommendations = recommender.predict_crops(farm_data)

    if recommendations:
        print(f"[ML ENGINE] ✅ Top {len(recommendations)} Recommended Crops:")
        for rec in recommendations:
            print(f"  {rec['rank']}. {rec['crop_name']} {rec.get('icon','🌱')}  "
                  f"|  Score: {rec['match_score']}%  "
                  f"|  Band: {rec['confidence_band']}  "
                  f"|  Est. Yield: {rec.get('estimated_yield_kg', '?')} kg  "
                  f"|  Profit: ₹{rec['profit_estimate']}")
    else:
        print("[ML ENGINE] ⚠️  No recommendations returned.")
    print("=" * 55 + "\n")

    # Mark farmer as no longer new after first recommendation
    farmer_id = farm_data.get("farmer_id")
    if farmer_id:
        farm_service.mark_farmer_active(farmer_id)

    return {"recommendations": recommendations, "status": "success"}


@router.get("/crop-details")
async def get_crop_details(crop: str = Query(..., description="Comma-separated crop names")):
    """
    Returns growth duration, yield, and cost data for crops.
    Data sourced from crops_merged.csv via RecommendationService.merged_df.
    """
    crop_names = [c.strip() for c in crop.split(",") if c.strip()]
    details = recommender.get_crop_details(crop_names)
    return {"crops": details}


@router.post("/feedback")
async def submit_feedback(request: FeedbackRequest):
    """
    Records the crop a farmer EXPLICITLY chose to grow.
    Only called when farmer taps 'I will grow this crop' — never on card browse.
    This feeds the weekly model retraining pipeline.
    """
    if not request.chosen_crop:
        raise HTTPException(status_code=400, detail="chosen_crop is required")

    recommender.record_feedback(
        farmer_id=request.farmer_id,
        farm_id=request.farm_id,
        recommended_crops=request.recommended_crops,
        chosen_crop=request.chosen_crop,
    )
    return {
        "status": "recorded",
        "message": f"Thank you! Your choice of {request.chosen_crop} has been noted.",
    }


@router.get("/history/{farmer_id}")
async def get_history(farmer_id: str):
    """
    Fetch the past recommendation and chosen crop history for a farmer.
    """
    history = recommender.get_feedback_history(farmer_id)
    return {"history": history, "status": "success"}
