// API configuration and utilities
const API_BASE_URL = 'https://abb-1-plti.onrender.com';
const API_V1_BASE = `${API_BASE_URL}/api/v1`;

/**
 * Make an authenticated API request
 * @param {string} endpoint - The API endpoint (without base URL)
 * @param {object} options - Fetch options
 * @param {Function} getIdToken - Function to get Firebase ID token
 * @returns {Promise<Response>}
 */
export const apiRequest = async (endpoint, options = {}, getIdToken) => {
  const token = await getIdToken();
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  };

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  const url = endpoint.startsWith('http') ? endpoint : `${API_V1_BASE}${endpoint}`;
  
  return fetch(url, finalOptions);
};

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  // User endpoints
  USER_PROFILE: '/user/profile',
  USER_VERIFY_TOKEN: '/user/verify-token',
  USER_PROTECTED: '/user/protected',
  
  // AI endpoints
  AI_CHAT: '/ai/chat',
  AI_STATUS: '/ai/status',
  
  // Chat session endpoints
  CHAT_SESSIONS: '/chat/sessions',
  CHAT_SESSION_MESSAGES: (sessionId) => `/chat/sessions/${sessionId}/messages`,
  CHAT_SESSION_UPDATE: (sessionId) => `/chat/sessions/${sessionId}`,
  
  // System endpoints
  HEALTH: '/health',
  ROOT: '/',
};

/**
 * Pre-configured API methods
 */
export const api = {
  /**
   * Send a chat message to AI
   */
  chat: async (message, conversationHistory, getIdToken) => {
    const response = await apiRequest(
      API_ENDPOINTS.AI_CHAT,
      {
        method: 'POST',
        body: JSON.stringify({
          message,
          conversation_history: conversationHistory,
        }),
      },
      getIdToken
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  },

  /**
   * Get user profile
   */
  getUserProfile: async (getIdToken) => {
    const response = await apiRequest(API_ENDPOINTS.USER_PROFILE, {}, getIdToken);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Verify authentication token
   */
  verifyToken: async (getIdToken) => {
    const response = await apiRequest(
      API_ENDPOINTS.USER_VERIFY_TOKEN,
      { method: 'POST' },
      getIdToken
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Get AI service status
   */
  getAIStatus: async (getIdToken) => {
    const response = await apiRequest(API_ENDPOINTS.AI_STATUS, {}, getIdToken);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};
