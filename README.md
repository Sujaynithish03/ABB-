# React + FastAPI Firebase Authentication App

A full-stack application with React frontend and FastAPI backend, featuring Firebase authentication and storage.

## Project Structure

```
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── contexts/     # React contexts
│   │   ├── lib/         # Utilities and configs
│   │   └── pages/       # Page components
│   └── package.json
└── server/            # FastAPI backend
    ├── main.py        # FastAPI application
    └── requirements.txt
```

## Features

- ✅ React frontend with Vite
- ✅ Tailwind CSS 3 for styling
- ✅ shadcn/ui components
- ✅ Firebase Authentication (Google Sign-in)
- ✅ Firebase Firestore for chat storage
- ✅ Protected routes
- ✅ FastAPI backend
- ✅ Firebase Admin SDK integration
- ✅ Chat sessions and history management
- ✅ Real-time chat interface
- ✅ IEC 61131-3 Programming Assistant
- ✅ Structured JSON responses (text, ladder diagrams, PLC code)
- ✅ Monaco Editor for code display
- ✅ Copy-to-clipboard functionality
- 🔄 Firebase Storage (ready for implementation)

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- Firebase Project

### Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Authentication and set up Google provider
4. Enable Firestore Database
5. Enable Storage
5. Get your Firebase config and service account key

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` file with your Firebase config:
   ```
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=your-app-id
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

### Backend Setup

1. Navigate to server directory:
   ```bash
   cd server
   ```

2. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Download your Firebase service account key and save as `firebase-service-account.json` in the server directory

5. Start the server:
   ```bash
   python main.py
   ```

## Usage

1. Start both frontend and backend servers
2. Open http://localhost:5173 in your browser
3. Click "Continue with Google" to authenticate
4. You'll be redirected to the protected home page

## API Endpoints

### System
- `GET /` - Root endpoint
- `GET /health` - Health check

### User (requires authentication)
- `GET /api/v1/user/profile` - Get user profile
- `POST /api/v1/user/verify-token` - Verify token validity
- `GET /api/v1/user/protected` - Protected endpoint example

### AI (requires authentication)
- `POST /api/v1/ai/chat` - Chat with Gemini AI
- `GET /api/v1/ai/status` - Get AI service status

### Chat Sessions (requires authentication)
- `POST /api/v1/chat/sessions` - Create new chat session
- `GET /api/v1/chat/sessions` - Get all user chat sessions
- `GET /api/v1/chat/sessions/{id}/messages` - Get messages for a session
- `POST /api/v1/chat/sessions/{id}/messages` - Send message to session
- `PUT /api/v1/chat/sessions/{id}` - Update session title
- `DELETE /api/v1/chat/sessions/{id}` - Delete chat session

## Next Steps

- Add more protected routes
- Implement file upload with Firebase Storage
- Add user management features
- Implement database integration
- Add error handling and notifications
