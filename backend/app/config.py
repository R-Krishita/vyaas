# app/config.py
# Configuration settings for the Smart Ayurvedic Crop Advisor backend

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # API Keys
    data_gov_api_key: str = ""
    
    # data.gov.in Mandi API endpoints
    # Resource ID for daily commodity prices
    mandi_resource_id: str = "9ef84268-d588-465a-a308-a864a43d0070"
    data_gov_base_url: str = "https://api.data.gov.in/resource"
    
    # Ayurvedic crops we support (matching data.gov.in commodity names)
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
    
    class Config:
        env_file = ".env"
        extra = "allow"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
