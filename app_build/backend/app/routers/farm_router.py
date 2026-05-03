
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
    temperature: str = "25`"
    waterSource: str = "Well"
    irrigationType: str = "Drip"
    season: str = "Kharif"
    previousCrop: str = ""
    budget: str = "0"
    # sunlightHours: str = "7"
    # elevation: str = ""
    humidity: str = ""
    soilMoisture: str = "0"
    organicCarbon: str = "0"
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
    def safe_float(val, default=0.0):
        try: return float(val) if val not in (None, '', 'None') else default
        except: return default

    # --- Step 1: Map camelCase → snake_case and convert to floats ---
    # soilPh → ph
    cleaned_data['ph'] = safe_float(cleaned_data.get('soilPh', cleaned_data.get('ph')), 6.5)
    # soilType → soil_type
    cleaned_data['soil_type'] = cleaned_data.get('soilType', 'Loamy')
    # soilMoisture → soil_moisture
    cleaned_data['soil_moisture'] = safe_float(cleaned_data.get('soilMoisture', cleaned_data.get('soil_moisture')), 50.0)
    # organicCarbon → organic_carbon
    cleaned_data['organic_carbon'] = safe_float(cleaned_data.get('organicCarbon', cleaned_data.get('organic_carbon')), 0.8)

    # --- Step 2: Convert camelCase numeric fields to floats in-place ---
    for camel_key in ['nitrogen', 'phosphorus', 'potassium', 'rainfall', 'temperature', 'humidity', 'budget']:
        cleaned_data[camel_key] = safe_float(cleaned_data.get(camel_key), 0.0)

    # --- Step 3: Defaults for fields that may still be zero/missing ---
    if cleaned_data.get('soil_moisture', 0) == 0:
        cleaned_data['soil_moisture'] = 50.0
    if cleaned_data.get('organic_carbon', 0) == 0:
        cleaned_data['organic_carbon'] = 0.8
    if cleaned_data.get('humidity', 0) == 0:
        cleaned_data['humidity'] = 60.0

    # --- Step 4: Derive climate_zone from state ---
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
