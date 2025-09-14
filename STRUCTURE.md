# Server Structure

This document describes the modular structure of the FastAPI application.

## Directory Structure

```
server/
├── main.py                     # Entry point (imports from app/)
├── requirements.txt            # Dependencies
├── firebase-service-account.json  # Firebase credentials
├── app/                        # Main application package
│   ├── __init__.py
│   ├── main.py                 # FastAPI app creation and configuration
│   ├── api/                    # API routes
│   │   ├── __init__.py
│   │   ├── main.py             # API router aggregator
│   │   ├── user.py             # User-related endpoints
│   │   └── ai.py               # AI/Chat endpoints
│   ├── core/                   # Core functionality
│   │   ├── __init__.py
│   │   ├── config.py           # Configuration settings
│   │   └── dependencies.py     # FastAPI dependencies
│   ├── models/                 # Pydantic models
│   │   ├── __init__.py
│   │   ├── user.py             # User models
│   │   └── chat.py             # Chat/AI models
│   └── services/               # Business logic services
│       ├── __init__.py
│       ├── firebase_service.py # Firebase authentication
│       └── gemini_service.py   # Gemini AI integration
```

## API Endpoints

### Base URLs
- Root: `http://localhost:8000/`
- API v1: `http://localhost:8000/api/v1/`

### Endpoints

#### System
- `GET /` - Root endpoint with status
- `GET /health` - Health check

#### User (requires authentication)
- `GET /api/v1/user/profile` - Get user profile
- `POST /api/v1/user/verify-token` - Verify authentication token
- `GET /api/v1/user/protected` - Protected endpoint example

#### AI (requires authentication)
- `POST /api/v1/ai/chat` - Chat with Gemini AI
- `GET /api/v1/ai/status` - Get AI service status

## Key Features

### Modular Design
- **Separation of Concerns**: Each module has a specific responsibility
- **Easy Testing**: Services can be easily mocked and tested
- **Scalability**: Easy to add new features and endpoints
- **Maintainability**: Clear code organization

### Services
- **Firebase Service**: Singleton pattern for Firebase authentication
- **Gemini Service**: Singleton pattern for AI chat functionality
- **Configuration**: Centralized settings management

### Security
- **JWT Authentication**: Firebase ID token verification
- **Protected Routes**: All API endpoints require authentication
- **CORS**: Properly configured for frontend integration

## Adding New Features

### Adding a New Route Module
1. Create a new file in `app/api/` (e.g., `storage.py`)
2. Define your router: `router = APIRouter(prefix="/storage", tags=["storage"])`
3. Add your endpoints with authentication: `current_user: dict = Depends(get_current_user)`
4. Include the router in `app/api/main.py`

### Adding a New Service
1. Create a new file in `app/services/` (e.g., `email_service.py`)
2. Implement singleton pattern if needed
3. Add configuration to `app/core/config.py`
4. Import and initialize in `app/main.py`

### Adding New Models
1. Create files in `app/models/` for your Pydantic models
2. Import them in your route modules

## Environment Variables

Create a `.env` file in the server directory:

```env
# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Server (optional)
HOST=0.0.0.0
PORT=8000
DEBUG=True
```
