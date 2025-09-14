from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.api.main import api_router
from app.services.firebase_service import firebase_service
from app.services.gemini_service import gemini_service

# Create FastAPI app
app = FastAPI(
    title="Firebase Auth API", 
    version="1.0.0",
    description="A modular FastAPI application with Firebase authentication and Gemini AI integration"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services (this will trigger the singleton initialization)
firebase_service  # Initialize Firebase
gemini_service    # Initialize Gemini

# Import firestore service to initialize it
from app.services.firestore_service import firestore_service
firestore_service  # Initialize Firestore

# Add exception handler for validation errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Custom handler for request validation errors to provide better debugging info
    """
    print(f"Validation error on {request.method} {request.url}")
    print(f"Validation errors: {exc.errors()}")
    
    return JSONResponse(
        status_code=422,
        content={
            "detail": "Request validation failed",
            "errors": exc.errors()
        }
    )

# Include API routes
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    """
    Root endpoint
    """
    return {
        "message": "Firebase Auth API is running!",
        "version": "1.0.0",
        "firebase_initialized": True,
        "gemini_available": gemini_service.is_available()
    }

@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {
        "status": "healthy", 
        "service": "Firebase Auth API",
        "firebase_ready": True,
        "gemini_ready": gemini_service.is_available()
    }
