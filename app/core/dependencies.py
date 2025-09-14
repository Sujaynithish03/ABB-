from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.services.firebase_service import firebase_service

# Security
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Verify Firebase ID token and return user information
    """
    try:
        # Extract the token from the Authorization header
        id_token = credentials.credentials
        print(f"Received token: {id_token[:50]}...")  # Log first 50 chars for debugging
        
        # Verify the ID token using Firebase service
        decoded_token = firebase_service.verify_id_token(id_token)
        print(f"Token verified for user: {decoded_token.get('email', 'unknown')}")
        
        return decoded_token
    except Exception as e:
        print(f"Authentication error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
