# app/routers/chatbot.py
# Chatbot API routes for AI-powered agricultural assistance

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.chatbot_service import ChatbotService

router = APIRouter(prefix="/api/chatbot", tags=["Chatbot"])

# Initialize chatbot service
chatbot_service = ChatbotService()


class ChatRequest(BaseModel):
    """Request model for chatbot messages."""
    message: str
    farmer_id: Optional[str] = None
    context: Optional[str] = None


class ChatResponse(BaseModel):
    """Response model for chatbot replies."""
    reply: str
    quick_replies: list = []
    error: Optional[str] = None


@router.post("/ask", response_model=ChatResponse)
async def ask_chatbot(request: ChatRequest):
    """
    Send a message to the AI chatbot and get a response.
    
    The chatbot specializes in:
    - Ayurvedic/medicinal crop cultivation advice
    - Pest and disease management
    - Market price guidance
    - Organic farming practices
    
    Example request:
    ```json
    {
        "message": "How do I grow tulsi?",
        "farmer_id": "F001"
    }
    ```
    """
    
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    response = chatbot_service.get_response(
        user_message=request.message,
        farmer_id=request.farmer_id,
        context=request.context
    )
    
    return ChatResponse(
        reply=response.get("reply", "Sorry, I couldn't process your request."),
        quick_replies=response.get("quick_replies", []),
        error=response.get("error")
    )


@router.get("/health")
async def chatbot_health():
    """Check if the chatbot service is properly configured."""
    return {
        "status": "healthy" if chatbot_service.client else "not configured",
        "message": "Chatbot is ready" if chatbot_service.client else "Gemini API key not configured"
    }
