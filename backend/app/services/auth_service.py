# app/services/auth_service.py
# Twilio OTP authentication service

from twilio.rest import Client
from app.config import get_settings


class AuthService:
    """Handles OTP send and verify via Twilio Verify."""

    def __init__(self):
        settings = get_settings()
        self.client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
        self.verify_sid = settings.twilio_verify_service_sid

    def send_otp(self, phone: str) -> bool:
        """
        Send OTP to the given phone number.
        Phone must include country code, e.g. '+919876543210'.
        """
        verification = self.client.verify.services(self.verify_sid).verifications.create(
            to=phone,
            channel='sms'
        )
        return verification.status == "pending"

    def verify_otp(self, phone: str, otp: str) -> bool:
        """
        Verify the OTP code for the given phone number.
        Returns True if the code is correct.
        """
        result = self.client.verify.services(self.verify_sid).verification_checks.create(
            to=phone,
            code=otp
        )
        return result.status == "approved"


# Singleton instance
auth_service = AuthService()
