from pydantic import BaseModel
from typing import Optional

class UserResponse(BaseModel):
    uid: str
    email: Optional[str] = None
    name: Optional[str] = None
    picture: Optional[str] = None
    email_verified: bool = False

class MessageResponse(BaseModel):
    message: str
    user: Optional[UserResponse] = None
