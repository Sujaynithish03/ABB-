from firebase_admin import firestore
from google.cloud.firestore import FieldFilter
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
from app.models.session import ChatSession, ChatMessage, SessionResponse
from app.services.firebase_service import firebase_service

class FirestoreService:
    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            self._initialize_firestore()
            self._initialized = True
    
    def _initialize_firestore(self):
        """Initialize Firestore client"""
        try:
            # Ensure Firebase is initialized first
            firebase_service  # This will initialize Firebase if not already done
            self.db = firestore.client()
            print("Firestore client initialized successfully.")
        except Exception as e:
            print(f"Error initializing Firestore: {e}")
            self.db = None
    
    def is_available(self) -> bool:
        """Check if Firestore is available"""
        return self.db is not None
    
    def create_chat_session(self, user_id: str, title: str = "New Chat") -> str:
        """Create a new chat session"""
        if not self.is_available():
            raise ValueError("Firestore not available")
        
        session_id = str(uuid.uuid4())
        now = datetime.utcnow()
        
        session_data = {
            "session_id": session_id,
            "user_id": user_id,
            "title": title,
            "created_at": now,
            "updated_at": now,
            "message_count": 0,
            "last_message": None
        }
        
        # Store in Firestore
        self.db.collection("chat_sessions").document(session_id).set(session_data)
        
        return session_id
    
    def get_user_sessions(self, user_id: str, limit: int = 50) -> List[SessionResponse]:
        """Get all chat sessions for a user"""
        if not self.is_available():
            raise ValueError("Firestore not available")
        
        try:
            # First try with ordering (this might fail if no composite index exists)
            sessions_ref = (
                self.db.collection("chat_sessions")
                .where(filter=FieldFilter("user_id", "==", user_id))
                .order_by("updated_at", direction=firestore.Query.DESCENDING)
                .limit(limit)
            )
            
            sessions = []
            for doc in sessions_ref.stream():
                data = doc.to_dict()
                if data:  # Ensure data is not None
                    sessions.append(SessionResponse(
                        session_id=data.get("session_id", doc.id),
                        title=data.get("title", "Untitled Chat"),
                        created_at=data.get("created_at"),
                        updated_at=data.get("updated_at"),
                        message_count=data.get("message_count", 0),
                        last_message=data.get("last_message")
                    ))
            
            return sessions
            
        except Exception as e:
            print(f"Error with ordered query, trying simple query: {e}")
            # Fallback: simple query without ordering
            try:
                sessions_ref = (
                    self.db.collection("chat_sessions")
                    .where(filter=FieldFilter("user_id", "==", user_id))
                    .limit(limit)
                )
                
                sessions = []
                for doc in sessions_ref.stream():
                    data = doc.to_dict()
                    if data:  # Ensure data is not None
                        sessions.append(SessionResponse(
                            session_id=data.get("session_id", doc.id),
                            title=data.get("title", "Untitled Chat"),
                            created_at=data.get("created_at"),
                            updated_at=data.get("updated_at"),
                            message_count=data.get("message_count", 0),
                            last_message=data.get("last_message")
                        ))
                
                # Sort by updated_at in Python if available
                sessions.sort(key=lambda x: x.updated_at or x.created_at, reverse=True)
                return sessions
                
            except Exception as e2:
                print(f"Error with simple query: {e2}")
                # Return empty list if both queries fail
                return []
    
    def get_session_messages(self, session_id: str, user_id: str, limit: int = 100) -> List[ChatMessage]:
        """Get all messages for a chat session"""
        if not self.is_available():
            raise ValueError("Firestore not available")
        
        # Verify session belongs to user
        session_doc = self.db.collection("chat_sessions").document(session_id).get()
        if not session_doc.exists or session_doc.to_dict().get("user_id") != user_id:
            raise ValueError("Session not found or access denied")
        
        messages_ref = (
            self.db.collection("chat_sessions").document(session_id)
            .collection("messages")
            .order_by("timestamp")
            .limit(limit)
        )
        
        messages = []
        for doc in messages_ref.stream():
            data = doc.to_dict()
            messages.append(ChatMessage(
                role=data["role"],
                content=data["content"],
                timestamp=data["timestamp"],
                message_id=doc.id
            ))
        
        return messages
    
    def add_message_to_session(
        self, 
        session_id: str, 
        user_id: str, 
        role: str, 
        content: str
    ) -> str:
        """Add a message to a chat session"""
        if not self.is_available():
            raise ValueError("Firestore not available")
        
        # Verify session belongs to user
        session_ref = self.db.collection("chat_sessions").document(session_id)
        session_doc = session_ref.get()
        
        if not session_doc.exists or session_doc.to_dict().get("user_id") != user_id:
            raise ValueError("Session not found or access denied")
        
        # Add message
        message_id = str(uuid.uuid4())
        now = datetime.utcnow()
        
        message_data = {
            "role": role,
            "content": content,
            "timestamp": now,
            "message_id": message_id
        }
        
        # Add message to subcollection
        session_ref.collection("messages").document(message_id).set(message_data)
        
        # Update session metadata
        session_data = session_doc.to_dict()
        session_ref.update({
            "updated_at": now,
            "message_count": session_data.get("message_count", 0) + 1,
            "last_message": content[:100] + "..." if len(content) > 100 else content
        })
        
        return message_id
    
    def update_session_title(self, session_id: str, user_id: str, title: str) -> bool:
        """Update the title of a chat session"""
        if not self.is_available():
            raise ValueError("Firestore not available")
        
        session_ref = self.db.collection("chat_sessions").document(session_id)
        session_doc = session_ref.get()
        
        if not session_doc.exists or session_doc.to_dict().get("user_id") != user_id:
            raise ValueError("Session not found or access denied")
        
        session_ref.update({
            "title": title,
            "updated_at": datetime.utcnow()
        })
        
        return True
    
    def delete_session(self, session_id: str, user_id: str) -> bool:
        """Delete a chat session and all its messages"""
        if not self.is_available():
            raise ValueError("Firestore not available")
        
        session_ref = self.db.collection("chat_sessions").document(session_id)
        session_doc = session_ref.get()
        
        if not session_doc.exists or session_doc.to_dict().get("user_id") != user_id:
            raise ValueError("Session not found or access denied")
        
        # Delete all messages in the session
        messages_ref = session_ref.collection("messages")
        for doc in messages_ref.stream():
            doc.reference.delete()
        
        # Delete the session
        session_ref.delete()
        
        return True

# Create singleton instance
firestore_service = FirestoreService()
