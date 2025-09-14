import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Settings:
    # Server settings
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8000))
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # Firebase settings
    FIREBASE_SERVICE_ACCOUNT_PATH: str = "firebase-service-account.json"
    
    # Gemini AI settings
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # CORS settings
    ALLOWED_ORIGINS: list = [
        "https://abb-1-plti.onrender.com",
        "https://curious-yeot-285019.netlify.app/",
        "http://localhost:3000",
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]

settings = Settings()
