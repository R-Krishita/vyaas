# app/routers/auth.py
# Authentication router - Twilio OTP login endpoints

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.auth_service import auth_service

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


class OTPRequest(BaseModel):
    phone: str  # e.g. "+919876543210"


class OTPVerifyRequest(BaseModel):
    phone: str
    otp: str


class RegisterRequest(BaseModel):
    name: str
    phone: str
    total_farm_size_acres: str
    state: str
    district: str
    current_crop: str = ""


@router.post("/otp")
async def send_otp(request: OTPRequest):
    """Send OTP to phone number via Twilio."""
    try:
        sent = auth_service.send_otp(request.phone)
        if sent:
            return {"success": True, "message": "OTP sent successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to send OTP")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/verify")
async def verify_otp(request: OTPVerifyRequest):
    """Verify OTP code and return auth token."""
    try:
        verified = auth_service.verify_otp(request.phone, request.otp)
        if verified:
            return {
                "success": True,
                "token": "placeholder_jwt_token",  # TODO: generate real JWT
                "farmer_id": "F001"                # TODO: lookup/create user
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid OTP")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/register")
async def register_farmer(request: RegisterRequest):
    """Register a new farmer profile after successful OTP."""
    import uuid
    from app.services.farm_service import farm_service
    import mysql.connector

    # Check if phone already registered
    existing = farm_service.get_farmer_by_phone(request.phone)
    if existing:
        raise HTTPException(status_code=400, detail="Phone number is already registered")

    farmer_id = str(uuid.uuid4())
    farmer_data = {
        "farmer_id": farmer_id,
        "name": request.name,
        "phone": request.phone,
        "state": request.state,
        "district": request.district,
        "total_farm_size_acres": request.total_farm_size_acres,
        "current_crop": request.current_crop
    }
    
    try:
        farm_service.save_farmer_profile(farmer_data)
        return {
            "success": True,
            "farmer_id": farmer_id,
            "message": "Profile created successfully"
        }
    except mysql.connector.Error as e:
        if e.errno == 1062: # Duplicate entry
            raise HTTPException(status_code=400, detail="Phone number is already registered")
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
