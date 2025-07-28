// API Configuration
export const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  auth: `${API_BASE_URL}/api/auth`,
  calendar: `${API_BASE_URL}/api/calendar`,
  gamification: `${API_BASE_URL}/api/gamification`,
  ai: `${API_BASE_URL}/api/ai`,
  email: `${API_BASE_URL}/api/email`,
  journal: `${API_BASE_URL}/api/journal`,
  learningGuide: `${API_BASE_URL}/api/learning-guide`,
  marketplace: `${API_BASE_URL}/api/marketplace-products`,
  media: `${API_BASE_URL}/api/media`,
  schoolHub: `${API_BASE_URL}/api/school-hub-dashboard`,
  threads: `${API_BASE_URL}/api/threads`,
  unified: `${API_BASE_URL}/api/unified`,
  classes: `${API_BASE_URL}/api/classes`,
  search: `${API_BASE_URL}/api/search`,
  moodFocus: `${API_BASE_URL}/api/mood-focus-checkin`,
};

