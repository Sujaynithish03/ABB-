export class LibraryService {
  constructor(user, getIdToken) {
    this.user = user;
    this.getIdToken = getIdToken;
    this.baseUrl = 'http://localhost:8000/api/v1/library';
  }

  /**
   * Save a question-answer pair to the knowledge library
   */
  async saveToLibrary(userQuestion, assistantResponse, sessionId, messagePairId = null) {
    try {
      const token = await this.getIdToken();
      
      // Extract text content from structured responses
      let responseContent = assistantResponse.content;
      if (typeof responseContent === 'object' && responseContent !== null) {
        if (responseContent.responses && Array.isArray(responseContent.responses)) {
          responseContent = responseContent.responses.map(r => r.content || '').join('\n\n');
        } else {
          responseContent = JSON.stringify(responseContent);
        }
      }
      
      const response = await fetch(`${this.baseUrl}/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_question: userQuestion,
          assistant_response: responseContent,
          session_id: sessionId,
          message_pair_id: messagePairId,
          tags: [], // TODO: Add tag extraction/categorization
          category: null // TODO: Add automatic categorization
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving to library:', error);
      throw error;
    }
  }

  /**
   * Get all library entries for the user
   */
  async getLibraryEntries(limit = 50) {
    try {
      const token = await this.getIdToken();
      const response = await fetch(`${this.baseUrl}/entries?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting library entries:', error);
      throw error;
    }
  }

  /**
   * Search through library entries
   */
  async searchLibrary(query, limit = 20, category = null, tags = []) {
    try {
      const token = await this.getIdToken();
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query,
          limit,
          category,
          tags
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching library:', error);
      throw error;
    }
  }

  /**
   * Get library statistics
   */
  async getLibraryStats() {
    try {
      const token = await this.getIdToken();
      const response = await fetch(`${this.baseUrl}/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting library stats:', error);
      throw error;
    }
  }

}
