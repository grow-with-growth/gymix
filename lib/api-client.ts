/**
 * API Client for interacting with the unified API
 * This provides a single interface for all backend services
 */

import { API_ENDPOINTS } from '../config/api';

// Generic API call function
async function callApi<T>(service: string, action: string, params: any = {}): Promise<T> {
  try {
    const response = await fetch(API_ENDPOINTS.unified, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for cookies
      body: JSON.stringify({
        service,
        action,
        params,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || errorData.error || 'API request failed');
    }

    const data = await response.json();
    return data.data as T;
  } catch (error) {
    console.error(`API Error (${service}/${action}):`, error);
    throw error;
  }
}

// File upload function
async function uploadFile(file: File, folder: string = 'general') {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await fetch(API_ENDPOINTS.unified, {
      method: 'PUT',
      credentials: 'include', // Important for cookies
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || errorData.error || 'File upload failed');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
}

// Authentication
export const auth = {
  async login(email: string, password: string) {
    return callApi('auth', 'login', { email, password });
  },

  async register(email: string, password: string, name: string, role: string = 'Student') {
    return callApi('auth', 'register', { email, password, name, role });
  },

  async logout() {
    return callApi('auth', 'logout');
  },

  async checkAuth() {
    return callApi('auth', 'check');
  },
};

// Calendar
export const calendar = {
  async getEvents(year?: number, month?: number) {
    return callApi('calendar', 'getEvents', { year, month });
  },

  async createEvent(event: any) {
    return callApi('calendar', 'createEvent', event);
  },

  async updateEvent(id: string, event: any) {
    return callApi('calendar', 'updateEvent', { id, event });
  },

  async deleteEvent(id: string) {
    return callApi('calendar', 'deleteEvent', { id });
  },

  async getEventById(id: string) {
    return callApi('calendar', 'getEventById', { id });
  },
};

// Users
export const users = {
  async getByDepartment(department: string) {
    return callApi('users', 'getByDepartment', { department });
  },

  async search(query: string) {
    return callApi('users', 'search', { query });
  },
};

// Knowledge Base
export const knowledge = {
  async getArticles() {
    return callApi('knowledge', 'getArticles');
  },

  async search(query: string) {
    return callApi('knowledge', 'search', { query });
  },
};

// Emails
export const emails = {
  async getByFolder(folder: string) {
    return callApi('emails', 'getByFolder', { folder });
  },

  async send(email: { subject: string; body: string; recipients: string[] }) {
    return callApi('emails', 'send', email);
  },
};

// Marketplace
export const marketplace = {
  async getProducts() {
    return callApi('marketplace', 'getProducts');
  },

  async getProductsByCategory(category: string) {
    return callApi('marketplace', 'getProductsByCategory', { category });
  },
};

// Games
export const games = {
  async getGames() {
    return callApi('games', 'getGames');
  },

  async getGamesByCategory(category: string) {
    return callApi('games', 'getGamesByCategory', { category });
  },
};

// Media
export const media = {
  async getMediaByType(type: 'Movies' | 'Series') {
    return callApi('media', 'getMediaByType', { type });
  },
};

// School Hub
export const schoolHub = {
  async getDashboardData(department: string) {
    return callApi('schoolHub', 'getDashboardData', { department });
  },
};

// AI
export const ai = {
  async generateInsights() {
    return callApi('ai', 'generateInsights');
  },

  async generateText(prompt: string) {
    return callApi('ai', 'generateText', { prompt });
  },
};

// Search
export const search = {
  async searchAll(query: string) {
    return callApi('search', 'searchAll', { query });
  },
};

// Storage
export const storage = {
  uploadFile,

  getFileUrl(record: any, filename: string) {
    return callApi('storage', 'getFileUrl', { record, filename });
  },
};

// Export all services as a named export
export const apiClient = {
  auth,
  calendar,
  users,
  knowledge,
  emails,
  marketplace,
  games,
  media,
  schoolHub,
  ai,
  search,
  storage,
};

// Export as default as well
export default apiClient;