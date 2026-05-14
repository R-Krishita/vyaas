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


@router.post("/check-phone")
async def check_phone_exists(request: OTPRequest):
    """Check if a phone number is registered in the system."""
    from app.services.farm_service import farm_service

    try:
        existing = farm_service.get_farmer_by_phone(request.phone)
        if existing:
            return {
                "exists": True,
                "farmer_id": existing.get("farmer_id", ""),
            }
        else:
            return {
                "exists": False,
            }
    except Exception as e:
        print(f"[AUTH] ❌ Error checking phone: {e}")
        raise HTTPException(status_code=500, detail=str(e))


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
    from app.services.farm_service import farm_service

    try:
        verified = auth_service.verify_otp(request.phone, request.otp)
        if verified:
            # Look up the farmer by phone number
            existing = farm_service.get_farmer_by_phone(request.phone)
            if existing:
                farmer_id = existing.get("farmer_id", "")
                print(f"[AUTH] ✅ Verified farmer: {farmer_id} ({request.phone})")
                return {
                    "success": True,
                    "token": "placeholder_jwt_token",  # TODO: generate real JWT
                    "farmer_id": farmer_id,
                    "registered": True,
                }
            else:
                # Phone verified but no profile exists — needs registration
                print(f"[AUTH] ⚠️ OTP verified but no profile for {request.phone}")
                return {
                    "success": True,
                    "token": "placeholder_jwt_token",
                    "farmer_id": "",
                    "registered": False,
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
    # pyrefly: ignore [missing-import]
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

@router.get("/profile/{farmer_id}")
async def get_profile(farmer_id: str):
    """Get the farmer profile by ID."""
    from app.services.farm_service import farm_service
    profile = farm_service.get_farmer_by_id(farmer_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile
