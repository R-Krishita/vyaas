
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.recommendation_service import RecommendationService
from app.services.farm_service import farm_service

router = APIRouter(prefix="/api/ml", tags=["Machine Learning"])
recommender = RecommendationService()

class RecommendRequest(BaseModel):
    farm_id: str

@router.post("/recommend")
async def get_recommendations(request: RecommendRequest):
    """
    Get crop recommendations based on saved farm details.
    """
    # 1. Retrieve farm details
    farm_data = farm_service.get_farm_details(request.farm_id)
    
    if not farm_data:
        # Fallback for demo if no data saved yet
        print(f" No data found for {request.farm_id}, using defaults")
        farm_data = {
            'nitrogen': 80, 'phosphorus': 40, 'potassium': 40, 'ph': 6.5,
            'soil_moisture': 50, 'organic_carbon': 0.5, 'soil_type': 'Loamy',
            'temperature': 25, 'rainfall': 1000, 'humidity': 60,
            'budget': 50000, 'climate_zone': 'Tropical'
        }

    # 2. Get predictions
    recommendations = recommender.predict_crops(farm_data)
    
    return {"recommendations": recommendations}
