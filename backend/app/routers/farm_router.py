
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.farm_service import farm_service

router = APIRouter(prefix="/api/farm", tags=["Farm"])

class FarmData(BaseModel):
    state: str = "Maharashtra"
    district: str = ""
    farmSize: str = ""
    soilType: str = "Black"
    soilPh: str = "6.5"
    nitrogen: str = "0"
    phosphorus: str = "0"
    potassium: str = "0"
    rainfall: str = "0"
    temperature: str = "25"
    waterSource: str = "Well"
    irrigationType: str = "Drip"
    season: str = "Kharif"
    previousCrop: str = ""
    budget: str = "0"
    laborCount: str = "0"
    organicPreference: bool = True
    sunlightHours: str = "7"
    elevation: str = ""
    humidity: str = ""
    farm_id: str = "FARM_001" # Default for single user demo

@router.post("/save")
async def save_farm(data: FarmData):
    """
    Save farm details to memory.
    """
    # Convert string inputs to numbers where necessary for the model
    # (The pydantic model keeps them as strings to match mobile app, 
    # but we clean them for the service)
    
    cleaned_data = data.model_dump()
    
    # Simple type conversion helper
    def safe_float(val):
        try: return float(val)
        except: return 0.0

    numeric_fields = ['nitrogen', 'phosphorus', 'potassium', 'ph', 
                      'rainfall', 'temperature', 'budget', 'humidity', 
                      'soil_moisture', 'organic_carbon']
                      
    for field in numeric_fields:
        if field in cleaned_data:
            cleaned_data[field] = safe_float(cleaned_data[field])
            
    # Map incompatible names (mobile sends camelCase, model needs snake_case)
    if 'soilPh' in cleaned_data:
        cleaned_data['ph'] = safe_float(cleaned_data['soilPh'])
    
    if 'soilType' in cleaned_data:
        cleaned_data['soil_type'] = cleaned_data['soilType']
    
    # Set sensible defaults for fields the mobile app doesn't collect
    if 'soil_moisture' not in cleaned_data or cleaned_data.get('soil_moisture') == 0:
        cleaned_data['soil_moisture'] = 50.0  # Average moisture
    
    if 'organic_carbon' not in cleaned_data or cleaned_data.get('organic_carbon') == 0:
        cleaned_data['organic_carbon'] = 0.8  # Average organic carbon
    
    # Derive climate_zone from state
    STATE_TO_CLIMATE = {
        'rajasthan': 'Semi-arid', 'gujarat': 'Semi-arid',
        'telangana': 'Semi-arid', 'andhra pradesh': 'Semi-arid',
        'kerala': 'Tropical', 'tamil nadu': 'Tropical',
        'karnataka': 'Tropical', 'goa': 'Tropical',
        'maharashtra': 'Tropical', 'odisha': 'Tropical',
        'west bengal': 'Subtropical', 'bihar': 'Subtropical',
        'uttar pradesh': 'Subtropical', 'jharkhand': 'Subtropical',
        'assam': 'Subtropical', 'meghalaya': 'Subtropical',
        'tripura': 'Subtropical', 'nagaland': 'Subtropical',
        'manipur': 'Subtropical', 'mizoram': 'Subtropical',
        'arunachal pradesh': 'Subtropical', 'sikkim': 'Subtropical',
        'madhya pradesh': 'Semi-arid', 'chhattisgarh': 'Subtropical',
        'punjab': 'Subtropical', 'haryana': 'Semi-arid',
        'himachal pradesh': 'Temperate', 'uttarakhand': 'Temperate',
        'jammu and kashmir': 'Temperate', 'ladakh': 'Arid',
    }
    state = cleaned_data.get('state', '')
    cleaned_data['climate_zone'] = STATE_TO_CLIMATE.get(state.lower(), 'Tropical')
        
    saved = farm_service.save_farm_details(cleaned_data)
    return {"status": "success", "data": saved}
