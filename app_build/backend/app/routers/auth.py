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
