from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: Optional[datetime] = None
    message_id: Optional[str] = None

class ChatSession(BaseModel):
    session_id: Optional[str] = None
    user_id: str
    title: Optional[str] = "New Chat"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    message_count: int = 0
    last_message: Optional[str] = None

class CreateSessionRequest(BaseModel):
    title: Optional[str] = "New Chat"

class UpdateSessionRequest(BaseModel):
    title: Optional[str] = None

class AddMessageRequest(BaseModel):
    message: str
    conversation_history: Optional[List[ChatMessage]] = []

class SessionResponse(BaseModel):
    session_id: str
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: int
    last_message: Optional[str] = None

class SessionListResponse(BaseModel):
    sessions: List[SessionResponse]
    total: int

class SessionMessagesResponse(BaseModel):
    session_id: str
    messages: List[ChatMessage]
    total: int
