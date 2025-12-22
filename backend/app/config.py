# app/config.py
# Configuration settings for the Smart Ayurvedic Crop Advisor backend

from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv
import os

# Load .env file
load_dotenv()

class Settings(BaseSettings):
    # API Keys
    data_gov_api_key: str
    openai_api_key: str

    # data.gov.in Mandi API endpoints
    mandi_resource_id: str = "9ef84268-d588-465a-a308-a864a43d0070"
    data_gov_base_url: str = "https://api.data.gov.in/resource"

    # Ayurvedic crops we support
    supported_crops: list = [
        "Turmeric",
        "Ginger", 
        "Aloe Vera",
        "Amla",
        "Neem Seed",
        "Ashwagandha",
        "Tulsi",
        "Shatavari",
        "Brahmi",
        "Giloy",
        "Safed Musli",
        "Isabgol"
    ]

    # ✅ SINGLE, CORRECT model_config
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,   # 🔥 THIS IS THE KEY FIX
        extra="allow"
    )


# Singleton instance
_settings = None

def get_settings() -> Settings:
    global _settings
    if _settings is None:
        _settings = Settings()
        # Debug logs
        print("[CONFIG] Settings loaded")
        print("[CONFIG] OPENAI_API_KEY env:", os.getenv("OPENAI_API_KEY", "NOT FOUND")[:20])
        print("[CONFIG] OPENAI_API_KEY settings:", _settings.openai_api_key[:20] if _settings.openai_api_key else "EMPTY")
    return _settings
