# app/services/chatbot_service.py
# Chatbot service using OpenAI ChatGPT API for intelligent agricultural assistance

from openai import OpenAI
from typing import Optional
import logging

from app.config import get_settings

logger = logging.getLogger(__name__)


class ChatbotService:
    """Service for handling chatbot interactions with OpenAI ChatGPT."""

    def __init__(self):
        """Initialize the chatbot service with OpenAI API."""
        self.settings = get_settings()
        self.client = None
        self._configure_openai()

    def _configure_openai(self):
        """Configure OpenAI API with the API key."""
        if not self.settings.openai_api_key:
            logger.warning("OpenAI API key not configured")
            self.client = None
            return

        try:
            self.client = OpenAI(api_key=self.settings.openai_api_key)
            logger.info("OpenAI API configured successfully")
        except Exception as e:
            logger.error(f"Failed to configure OpenAI API: {e}")
            self.client = None

    def get_response(
        self,
        user_message: str,
        farmer_id: Optional[str] = None,
        context: Optional[str] = None
    ) -> dict:
        """Generate a chatbot response using OpenAI ChatGPT."""

        if not self.client:
            return {
                "reply": "⚠️ Chatbot is not configured. Please add your OPENAI_API_KEY to the .env file.",
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

            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ]

            if context:
                messages.insert(1, {"role": "assistant", "content": f"Context: {context}"})

            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=300,
                temperature=0.7
            )

            reply_text = response.choices[0].message.content

            return {
                "reply": reply_text,
                "quick_replies": self._generate_quick_replies(user_message)
            }

        except Exception as e:
            logger.error(f"OpenAI response error: {e}")
            return {
                "reply": f"I'm having trouble answering right now. Error: {str(e)}",
                "quick_replies": ["Crop advice", "Market prices", "Pest control"],
                "error": str(e)
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
