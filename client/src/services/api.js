import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Skills API
export const skillsAPI = {
  // Get all skills with optional filters
  getAll: (params = {}) => {
    return api.get('/skills', { params });
  },

  // Get single skill by ID
  getById: (id) => {
    return api.get(`/skills/${id}`);
  },

  // Create new skill
  create: (skillData) => {
    return api.post('/skills', skillData);
  },

  // Update skill
  update: (id, skillData) => {
    return api.put(`/skills/${id}`, skillData);
  },

  // Delete skill
  delete: (id) => {
    return api.delete(`/skills/${id}`);
  },

  // Get category statistics
  getCategoryStats: () => {
    return api.get('/skills/stats/categories');
  },

  // Get overview statistics
  getOverviewStats: () => {
    return api.get('/skills/stats/overview');
  }
};

// Reviews API
export const reviewsAPI = {
  // Create review
  create: (reviewData) => {
    return api.post('/reviews', reviewData);
  },

  // Get reviews for a skill
  getBySkillId: (skillId, params = {}) => {
    return api.get(`/reviews/skill/${skillId}`, { params });
  },

  // Delete review
  delete: (id) => {
    return api.delete(`/reviews/${id}`);
  }
};

// Health check
export const healthCheck = () => {
  return api.get('/health');
};

export default api;

