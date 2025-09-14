import os
import firebase_admin
from firebase_admin import credentials, auth
from app.core.config import settings

class FirebaseService:
    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            self._initialize_firebase()
            self._initialized = True
    
    def _initialize_firebase(self):
        """Initialize Firebase Admin SDK"""
        try:
            # Check if Firebase app is already initialized
            firebase_admin.get_app()
            print("Firebase Admin SDK already initialized.")
        except ValueError:
            # App doesn't exist, so initialize it
            try:
                # For development, use service account key file
                if os.path.exists(settings.FIREBASE_SERVICE_ACCOUNT_PATH):
                    cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_PATH)
                    firebase_admin.initialize_app(cred)
                    print("Firebase Admin SDK initialized with service account.")
                else:
                    # Initialize with environment variables (for production)
                    cred = credentials.ApplicationDefault()
                    firebase_admin.initialize_app(cred)
                    print("Firebase Admin SDK initialized with default credentials.")
            except Exception as e:
                print(f"Firebase initialization error: {e}")
                print("Warning: Firebase Admin SDK not initialized. Authentication will not work.")
        except Exception as e:
            print(f"Error checking Firebase app status: {e}")
    
    def verify_id_token(self, id_token: str) -> dict:
        """Verify Firebase ID token and return user information"""
        try:
            decoded_token = auth.verify_id_token(id_token)
            return decoded_token
        except Exception as e:
            raise ValueError(f"Invalid authentication credentials: {str(e)}")

# Create singleton instance
firebase_service = FirebaseService()
