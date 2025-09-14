from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class LibraryEntry(BaseModel):
    entry_id: Optional[str] = None
    user_id: str
    user_name: Optional[str] = None  # Name of the person who added this
    user_question: str
    assistant_response: str
    session_id: str
    message_pair_id: Optional[str] = None  # To track the specific Q&A pair
    created_at: Optional[datetime] = None
    tags: Optional[List[str]] = []
    category: Optional[str] = None

class CreateLibraryEntryRequest(BaseModel):
    user_question: str
    assistant_response: str
    session_id: str
    message_pair_id: Optional[str] = None
    tags: Optional[List[str]] = []
    category: Optional[str] = None

class LibrarySearchRequest(BaseModel):
    query: str
    limit: Optional[int] = 20
    category: Optional[str] = None
    tags: Optional[List[str]] = []

class LibraryEntryResponse(BaseModel):
    entry_id: str
    user_name: Optional[str] = None
    user_question: str
    assistant_response: str
    session_id: str
    created_at: datetime
    tags: List[str]
    category: Optional[str] = None

class LibrarySearchResponse(BaseModel):
    entries: List[LibraryEntryResponse]
    total: int
    query: str

class LibraryStatsResponse(BaseModel):
    total_entries: int
    categories: List[dict]  # [{"name": "category", "count": 5}]
    recent_entries_count: int  # last 7 days
