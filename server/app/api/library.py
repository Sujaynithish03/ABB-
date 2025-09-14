from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.core.dependencies import get_current_user
from app.models.library import (
    CreateLibraryEntryRequest, LibrarySearchRequest,
    LibraryEntryResponse, LibrarySearchResponse, LibraryStatsResponse
)
from app.services.firestore_service import firestore_service
from google.cloud.firestore import FieldFilter
from firebase_admin import firestore
import uuid
from datetime import datetime

router = APIRouter(prefix="/library", tags=["library"])

@router.post("/entries", response_model=dict)
async def save_to_library(
    request: CreateLibraryEntryRequest,
    current_user: dict = Depends(get_current_user)
):
    """Save a question-answer pair to the knowledge library"""
    try:
        user_id = current_user.get("uid")
        
        # Create library entry
        entry_id = str(uuid.uuid4())
        
        # Get user's display name from the token
        user_name = current_user.get("name") or current_user.get("email", "Anonymous User")
        
        entry_data = {
            "entry_id": entry_id,
            "user_id": user_id,
            "user_name": user_name,
            "user_question": request.user_question,
            "assistant_response": request.assistant_response,
            "session_id": request.session_id,
            "message_pair_id": request.message_pair_id,
            "created_at": datetime.utcnow(),
            "tags": request.tags or [],
            "category": request.category
        }
        
        # Save to Firestore
        firestore_service.db.collection("knowledge_library").document(entry_id).set(entry_data)
        
        return {"entry_id": entry_id, "message": "Successfully saved to library"}
        
    except Exception as e:
        print(f"Error saving to library: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save to library: {str(e)}"
        )

@router.get("/entries", response_model=List[LibraryEntryResponse])
async def get_library_entries(
    current_user: dict = Depends(get_current_user),
    limit: int = 50
):
    """Get all library entries from all users (global library)"""
    try:
        user_id = current_user.get("uid")
        
        # Get all entries from Firestore (global library)
        entries_ref = firestore_service.db.collection("knowledge_library")
        query = entries_ref.order_by("created_at", direction=firestore.Query.DESCENDING).limit(limit)
        
        entries = []
        for doc in query.stream():
            data = doc.to_dict()
            entries.append(LibraryEntryResponse(
                entry_id=data["entry_id"],
                user_name=data.get("user_name", "Anonymous User"),
                user_question=data["user_question"],
                assistant_response=data["assistant_response"],
                session_id=data["session_id"],
                created_at=data["created_at"],
                tags=data.get("tags", []),
                category=data.get("category")
            ))
        
        return entries
        
    except Exception as e:
        print(f"Error getting library entries: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get library entries: {str(e)}"
        )

@router.post("/search", response_model=LibrarySearchResponse)
async def search_library(
    request: LibrarySearchRequest,
    current_user: dict = Depends(get_current_user)
):
    """Search through library entries - simplified to return all entries for frontend filtering"""
    try:
        user_id = current_user.get("uid")
        
        # Get all entries from all users - let frontend handle search/filtering
        entries_ref = firestore_service.db.collection("knowledge_library")
        query = entries_ref
        
        all_entries = []
        for doc in query.stream():
            data = doc.to_dict()
            all_entries.append(LibraryEntryResponse(
                entry_id=data["entry_id"],
                user_name=data.get("user_name", "Anonymous User"),
                user_question=data["user_question"],
                assistant_response=data["assistant_response"],
                session_id=data["session_id"],
                created_at=data["created_at"],
                tags=data.get("tags", []),
                category=data.get("category")
            ))
        
        return LibrarySearchResponse(
            entries=all_entries,
            total=len(all_entries),
            query=request.query
        )
        
    except Exception as e:
        print(f"Error searching library: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search library: {str(e)}"
        )

@router.get("/stats", response_model=LibraryStatsResponse)
async def get_library_stats(
    current_user: dict = Depends(get_current_user)
):
    """Get statistics about the global library"""
    try:
        user_id = current_user.get("uid")
        
        # Get all entries from all users
        entries_ref = firestore_service.db.collection("knowledge_library")
        query = entries_ref
        
        entries = []
        for doc in query.stream():
            entries.append(doc.to_dict())
        
        # Simple stats - let frontend handle complex calculations
        total_entries = len(entries)
        
        # Basic category count
        category_counts = {}
        for entry in entries:
            category = entry.get("category") or "General"
            category_counts[category] = category_counts.get(category, 0) + 1
        
        categories = [{"name": name, "count": count} for name, count in category_counts.items()]
        categories.sort(key=lambda x: x["count"], reverse=True)
        
        return LibraryStatsResponse(
            total_entries=total_entries,
            categories=categories,
            recent_entries_count=0  # Frontend will calculate this
        )
        
    except Exception as e:
        print(f"Error getting library stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get library stats: {str(e)}"
        )

