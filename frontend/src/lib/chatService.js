import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export class ChatService {
  constructor(user) {
    this.user = user;
    this.listeners = new Map();
  }

  /**
   * Get JWT token from localStorage
   */
  async getToken() {
    if (this.user && this.user.getIdToken) {
      return await this.user.getIdToken();
    }
    return null;
  }

  /**
   * Create a new chat session via API
   */
  async createSession(title = "New Chat") {
    try {
      const token = await this.getToken();
      const response = await fetch('https://abb-1-plti.onrender.com/api/v1/chat/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.session_id;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  /**
   * Get all sessions for the current user via API
   */
  async getSessions() {
    try {
      const token = await this.getToken();
      const response = await fetch('https://abb-1-plti.onrender.com/api/v1/chat/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.sessions;
    } catch (error) {
      console.error('Error getting sessions:', error);
      throw error;
    }
  }

  /**
   * Get messages for a specific session via API
   */
  async getSessionMessages(sessionId) {
    try {
      const token = await this.getToken();
      const response = await fetch(`https://abb-1-plti.onrender.com/api/v1/chat/sessions/${sessionId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.messages;
    } catch (error) {
      console.error('Error getting session messages:', error);
      throw error;
    }
  }

  /**
   * Send a message to a session via API
   */
  async sendMessage(sessionId, message, conversationHistory = []) {
    try {
      const token = await this.getToken();

      // Clean up conversation history format for backend
      const cleanHistory = conversationHistory.map((msg) => {
        let content = msg.content;

        // If content is an object (structured response), convert to string
        if (typeof content === 'object' && content !== null) {
          if (content.responses && Array.isArray(content.responses)) {
            // Extract text content from structured responses
            content = content.responses.map(r => r.content || '').join('\n\n');
          } else {
            content = JSON.stringify(content);
          }
        }

        return {
          role: msg.role,
          content: String(content), // Ensure it's always a string
          ...(msg.timestamp && { timestamp: new Date(msg.timestamp).toISOString() })
        };
      });

      const response = await fetch(`https://abb-1-plti.onrender.com/api/v1/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message,
          conversation_history: cleanHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Always parse the response content consistently
      if (typeof data.response === 'string') {
        try {
          const parsed = JSON.parse(data.response);

          // Response should always be an array due to response schema
          if (Array.isArray(parsed)) {
            const validResponses = parsed.every(item =>
              item && typeof item === 'object' && item.type && item.content
            );
            if (validResponses) {
              return { responses: parsed };
            }
          }
        } catch (e) {
          // Not JSON, return as text
        }
      }

      // Fallback to text response
      return {
        type: "text",
        content: data.response || "No response received"
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Update session title via API
   */
  async updateSessionTitle(sessionId, title) {
    try {
      const token = await this.getToken();
      const response = await fetch(`https://abb-1-plti.onrender.com/api/v1/chat/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating session title:', error);
      throw error;
    }
  }

  /**
   * Delete a session via API
   */
  async deleteSession(sessionId) {
    try {
      const token = await this.getToken();
      const response = await fetch(`https://abb-1-plti.onrender.com/api/v1/chat/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }

  /**
   * Listen to real-time updates for user sessions
   */
  listenToSessions(callback) {
    if (!this.user?.uid) return null;

    const sessionsRef = query(
      collection(db, 'chat_sessions'),
      where('user_id', '==', this.user.uid),
      orderBy('updated_at', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      sessionsRef,
      (snapshot) => {
        const sessions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(sessions);
      },
      (error) => {
        console.error('Error listening to sessions:', error);
      }
    );

    return unsubscribe;
  }

  /**
   * Listen to real-time updates for session messages
   */
  listenToSessionMessages(sessionId, callback) {
    if (!sessionId) return null;

    const messagesRef = query(
      collection(db, 'chat_sessions', sessionId, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(
      messagesRef,
      (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(messages);
      },
      (error) => {
        console.error('Error listening to messages:', error);
      }
    );

    this.listeners.set(sessionId, unsubscribe);
    return unsubscribe;
  }

  /**
   * Stop listening to a specific session
   */
  stopListeningToSession(sessionId) {
    const unsubscribe = this.listeners.get(sessionId);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(sessionId);
    }
  }

  /**
   * Stop all listeners
   */
  stopAllListeners() {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
  }

  /**
   * Generate a smart title for a session based on the first message
   */
  generateSessionTitle(firstMessage) {
    if (!firstMessage) return "New Chat";

    // Take first 50 characters and clean up
    let title = firstMessage.substring(0, 50).trim();

    // Remove incomplete words at the end
    const lastSpace = title.lastIndexOf(' ');
    if (lastSpace > 20) {
      title = title.substring(0, lastSpace);
    }

    // Add ellipsis if truncated
    if (firstMessage.length > 50) {
      title += "...";
    }

    return title || "New Chat";
  }
}
