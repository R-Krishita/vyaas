# app/services/chatbot_service.py
# Chatbot service using Google Gemini API for intelligent agricultural assistance

import google.genai as genai
from typing import Optional
import logging

from app.config import get_settings

logger = logging.getLogger(__name__)


class ChatbotService:
    """Service for handling chatbot interactions with Google Gemini."""

    def __init__(self):
        """Initialize the chatbot service with Gemini API."""
        self.settings = get_settings()
        self.client = None
        self._configure_gemini()

    def _configure_gemini(self):
        """Configure Gemini API with the API key."""
        if not self.settings.gemini_api_key or self.settings.gemini_api_key == "your_gemini_api_key_here":
            logger.warning("Gemini API key not configured")
            self.client = None
            return

        try:
            self.client = genai.Client(api_key=self.settings.gemini_api_key)
            logger.info("Gemini API configured successfully")
        except Exception as e:
            logger.error(f"Failed to configure Gemini API: {e}")
            self.client = None

    def get_response(
        self,
        user_message: str,
        farmer_id: Optional[str] = None,
        context: Optional[str] = None
    ) -> dict:
        """Generate a chatbot response using Google Gemini."""

        if not self.client:
            return {
                "reply": "⚠️ Chatbot is not configured. Please add your GEMINI_API_KEY to the .env file.",
                "quick_replies": [],
                "error": "API key not configured"
            }

        try:
            system_prompt = (
                "You are an expert agricultural assistant specializing in Ayurvedic "
                "and medicinal crops like Tulsi, Ashwagandha, Turmeric, Ginger, Aloe Vera. "
                "Provide clear, practical, farmer-friendly advice. "
                "Keep answers concise (under 150 words) and useful."
            )

            full_prompt = f"{system_prompt}\n\n"
            if context:
                full_prompt += f"Context: {context}\n\n"
            full_prompt += f"User question: {user_message}"

            response = self.client.models.generate_content(
                model="gemini-2.0-flash",
                contents=full_prompt
            )
            reply_text = response.text

            return {
                "reply": reply_text,
                "quick_replies": self._generate_quick_replies(user_message)
            }

        except Exception as e:
            logger.error(f"Gemini response error: {e}")

            error_text = str(e) if e is not None else "Unknown error"
            normalized = error_text.lower()

            if "resource_exhausted" in normalized or "quota" in normalized or "429" in normalized:
                reply = (
                    "⚠️ Gemini quota exceeded for this API key. "
                    "Please check your Gemini API plan/billing and rate limits, then try again."
                )
            elif "unauth" in normalized or "permission" in normalized or "401" in normalized or "api key" in normalized:
                reply = (
                    "⚠️ Gemini authentication failed. "
                    "Please verify `GEMINI_API_KEY` in `backend/.env` and restart the backend."
                )
            else:
                reply = "I'm having trouble answering right now. Please try again in a moment."

            return {
                "reply": reply,
                "quick_replies": ["Crop advice", "Market prices", "Pest control"],
                "error": error_text[:500]
            }

    def _generate_quick_replies(self, user_message: str) -> list:
        """Generate simple contextual quick replies."""
        text = user_message.lower()

        if any(word in text for word in ["crop", "plant", "grow", "cultivate"]):
            return ["Soil requirements", "Watering schedule", "Pest control"]
        if any(word in text for word in ["price", "market", "sell"]):
            return ["Best mandis", "Price trends", "When to sell"]
        if any(word in text for word in ["pest", "disease", "insect"]):
            return ["Organic solution", "Chemical treatment", "Prevention tips"]
        if any(word in text for word in ["harvest", "storage"]):
            return ["Post-harvest care", "Storage tips", "Processing"]

        return ["Tell me more", "Market prices", "Crop advice"]


# Singleton instance
_chatbot_service = None


def get_chatbot_service() -> ChatbotService:
    """Get the singleton chatbot service instance."""
    global _chatbot_service
    if _chatbot_service is None:
        _chatbot_service = ChatbotService()
    return _chatbot_service
