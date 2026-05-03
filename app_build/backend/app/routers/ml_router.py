from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from app.services.recommendation_service import RecommendationService
from app.services.farm_service import farm_service

router = APIRouter(prefix="/api/ml", tags=["Machine Learning"])
recommender = RecommendationService()

class RecommendRequest(BaseModel):
    farm_id: str

@router.post("/recommend")
async def get_recommendations(request: RecommendRequest):
    """Get crop recommendations based on saved farm details."""
    # 1. Retrieve farm details
    farm_data = farm_service.get_farm_details(request.farm_id)
    
    if not farm_data:
        print(f"\n[ML ENGINE] ❌ No farm data found for farm_id='{request.farm_id}'")
        return {"recommendations": [], "status": "no_data"}

    # 2. Log the inputs in a fancy terminal format
    print("\n" + "="*55)
    print(f"[ML ENGINE] 🌾 Predicting crops for farm_id='{request.farm_id}'")
    print("-"*55)
    print(f"  📍 State          : {farm_data.get('state', '')} / {farm_data.get('district', '')}")
    print(f"  🌡️  Temperature    : {farm_data.get('temperature', 0.0)} °C")
    print(f"  🌧️  Rainfall       : {farm_data.get('rainfall', 0.0)} mm")
    print(f"  💧 Humidity       : {farm_data.get('humidity', 0.0)} %")
    print(f"  🪨  Soil Type      : {farm_data.get('soil_type', farm_data.get('soilType', 'N/A'))}")
    print(f"  🧪 Soil pH        : {farm_data.get('ph', farm_data.get('soilPh', 6.5))}")
    print(f"  💧 Soil Moisture  : {farm_data.get('soil_moisture', 0.0)} %")
    print(f"  🍂 Organic Carbon : {farm_data.get('organic_carbon', 0.0)} %")
    print(f"  🌿 Nitrogen       : {farm_data.get('nitrogen', 0.0)} kg/ha")
    print(f"  🧬 Phosphorus     : {farm_data.get('phosphorus', 0.0)} kg/ha")
    print(f"  ⚗️  Potassium      : {farm_data.get('potassium', 0.0)} kg/ha")
    print(f"  🌍 Climate Zone   : {farm_data.get('climate_zone', 'N/A')}")
    print(f"  💰 Budget         : ₹{farm_data.get('budget', 0.0)}")
    print("-"*55)

    # 3. Get predictions
    recommendations = recommender.predict_crops(farm_data)

    # 4. Log the results
    if recommendations:
        print(f"[ML ENGINE] ✅ Top {len(recommendations)} Recommended Crops:")
        for rec in recommendations:
            print(f"  {rec['rank']}. {rec['crop_name']} {rec.get('icon','🌱')}  |  Score: {rec['match_score']}%  |  Band: {rec['confidence_band']}  |")
            print(f"Profit: ₹{rec['profit_estimate']}")
    else:
        print("[ML ENGINE] ⚠️  No recommendations returned.")
    print("="*55 + "\n")
    
    return {"recommendations": recommendations}

@router.get("/crop-details")
async def get_crop_details(crop: str = Query(..., description="Comma-separated crop names")):
    """Returns master and economics data for specific crops."""
    crops = [c.strip() for c in crop.split(',')]
    details = []
    
    for c_name in crops:
        crop_info = {"crop_name": c_name}
        crop_id = None
        if recommender.master_df is not None:
            master = recommender.master_df[recommender.master_df['crop_name'].str.lower() == c_name.lower()]
            if not master.empty:
                crop_id = master['crop_id'].values[0]
                crop_info["growth_days"] = int(master['growth_duration_days_max'].values[0])
                crop_info["growth_days_min"] = int(master['growth_duration_days_min'].values[0])
        
        if crop_id is not None and recommender.economics_df is not None:
            econ = recommender.economics_df[recommender.economics_df['crop_id'] == crop_id]
            if not econ.empty:
                crop_info["yield_avg"] = float((econ['yield_min_per_acre'].values[0] + econ['yield_max_per_acre'].values[0]) / 2)
                crop_info["cost_avg"] = float((econ['cost_of_cultivation_min'].values[0] + econ['cost_of_cultivation_max'].values[0]) / 2)
        
        details.append(crop_info)
    return {"crops": details}
