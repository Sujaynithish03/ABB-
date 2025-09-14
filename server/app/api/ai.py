from fastapi import APIRouter, Depends, HTTPException, status
from app.core.dependencies import get_current_user
from app.models.chat import ChatRequest, ChatResponse
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post("/chat", response_model=ChatResponse)
async def chat_with_gemini(
    chat_request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Send a message to Gemini 2.0 Flash and get a response
    """
    try:
        if not gemini_service.is_available():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Gemini API key not configured"
            )
        
        # Convert Pydantic models to dict for the service
        conversation_history = [
            {"role": msg.role, "content": msg.content} 
            for msg in chat_request.conversation_history
        ] if chat_request.conversation_history else []
        
        # Get response from Gemini service
        response_text = gemini_service.chat(
            message=chat_request.message,
            conversation_history=conversation_history
        )
        
        return ChatResponse(
            response=response_text,
            success=True
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get response from Gemini: {str(e)}"
        )

@router.get("/status")
async def get_ai_status(current_user: dict = Depends(get_current_user)):
    """
    Get the status of AI services
    """
    return {
        "gemini_available": gemini_service.is_available(),
        "user_id": current_user.get("uid"),
        "service": "Gemini 2.0 Flash"
    }
