from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user
from app.models.user import UserResponse, MessageResponse

router = APIRouter(prefix="/user", tags=["user"])

@router.get("/profile", response_model=UserResponse)
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    """
    Get current user's profile information
    """
    return UserResponse(
        uid=current_user.get("uid"),
        email=current_user.get("email"),
        name=current_user.get("name"),
        picture=current_user.get("picture"),
        email_verified=current_user.get("email_verified", False)
    )

@router.post("/verify-token")
async def verify_token(current_user: dict = Depends(get_current_user)):
    """
    Verify if the provided token is valid
    """
    return {
        "valid": True,
        "uid": current_user.get("uid"),
        "email": current_user.get("email")
    }

@router.get("/protected", response_model=MessageResponse)
async def protected_route(current_user: dict = Depends(get_current_user)):
    """
    Protected endpoint that requires authentication
    """
    user_info = UserResponse(
        uid=current_user.get("uid"),
        email=current_user.get("email"),
        name=current_user.get("name"),
        picture=current_user.get("picture"),
        email_verified=current_user.get("email_verified", False)
    )
    
    return MessageResponse(
        message=f"Hello {current_user.get('name', 'User')}! This is a protected endpoint.",
        user=user_info
    )
