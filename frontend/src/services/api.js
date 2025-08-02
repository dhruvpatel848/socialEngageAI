import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const ML_SERVICE_URL = process.env.NEXT_PUBLIC_ML_SERVICE_URL || 'http://localhost:8000';

// Create axios instances
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const mlClient = axios.create({
  baseURL: ML_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
const addAuthToken = (client) => {
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // Also add x-auth-token header for backend compatibility
        config.headers['x-auth-token'] = token;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};

addAuthToken(apiClient);
addAuthToken(mlClient);

// Auth services
export const authService = {
  login: async (credentials) => {
    const response = await apiClient.post('/api/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await apiClient.post('/api/auth/register', userData);
    return response.data;
  },
  getUsers: async () => {
    const response = await apiClient.get('/api/admin/users');
    return response.data;
  },
  deleteUser: async (userId) => {
    const response = await apiClient.delete(`/api/admin/users/${userId}`);
    return response.data;
  },
  updateUser: async (userId, userData) => {
    const response = await apiClient.put(`/api/admin/users/${userId}`, userData);
    return response.data;
  },
  createUser: async (userData) => {
    const response = await apiClient.post('/api/admin/users', userData);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: async () => {
    // Check if we have a token first
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    try {
      // Try to get user data from API
      const response = await apiClient.get('/api/auth/me');
      if (response.data && response.data.success && response.data.data) {
        // Store the fresh user data
        const userData = response.data.data;
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      } else if (response.data && response.data.data) {
        // Handle legacy response format
        const userData = response.data.data;
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      } else {
        throw new Error('Invalid response format from /api/auth/me');
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      
      // Check if we have stored user data as fallback
      const storedUser = authService.getStoredUser();
      if (storedUser) {
        return storedUser;
      }
      
      // No stored user data either
      throw new Error('Could not retrieve user data');
    }
  },
  
  getStoredUser: () => {
    try {
      const user = localStorage.getItem('user');
      if (user) {
        return JSON.parse(user);
      }
      return null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  },
};

// Prediction services
export const predictionService = {
  getPrediction: async (postData) => {
    const response = await apiClient.post('/api/predict', postData);
    return response.data;
  },
  getPredictionHistory: async (page = 1, limit = 10) => {
    const response = await apiClient.get(`/api/predict/history?page=${page}&limit=${limit}`);
    return response.data;
  },
  updateActuals: async (predictionId, actualData) => {
    const response = await apiClient.put(`/api/predict/${predictionId}/actuals`, actualData);
    return response.data;
  },
  deletePrediction: async (predictionId) => {
    const response = await apiClient.delete(`/api/predict/${predictionId}`);
    return response.data;
  },
};

// Dashboard services
export const dashboardService = {
  getStats: async (timeRange = '30days') => {
    const response = await apiClient.get(`/api/data/stats?timeRange=${timeRange}`);
    return response.data;
  },
  getModelMetrics: async () => {
    const performanceResponse = await apiClient.get('/api/metrics/performance');
    const featureResponse = await apiClient.get('/api/metrics/feature-importance');
    const contentResponse = await apiClient.get('/api/metrics/content-analysis');
    
    return {
      performance: performanceResponse.data,
      featureImportance: featureResponse.data,
      contentAnalysis: contentResponse.data,
    };
  },
};

// ML service specific endpoints
export const mlService = {
  getBestTimeToPost: async (userData) => {
    const response = await mlClient.post('/api/best-time', userData);
    return response.data;
  },
  getContentSuggestions: async (postText) => {
    const response = await mlClient.post('/api/content-suggestions', { post_text: postText });
    return response.data;
  },
  getHashtagSuggestions: async (postText) => {
    const response = await mlClient.post('/api/hashtag-suggestions', { post_text: postText });
    return response.data;
  },
};

// Data services
export const dataService = {
  getPosts: async (page = 1, limit = 10, filters = {}) => {
    // Build query params
    const params = new URLSearchParams({
      page,
      limit,
    });

    // Add filters if they exist
    if (filters.media_type) params.append('media_type', filters.media_type);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);

    const response = await apiClient.get(`/api/data/posts?${params.toString()}`);
    return response.data;
  },
  getPostById: async (postId) => {
    const response = await apiClient.get(`/api/data/posts/${postId}`);
    return response.data;
  },
  deletePost: async (postId) => {
    const response = await apiClient.delete(`/api/data/posts/${postId}`);
    return response.data;
  },
};

export default {
  authService,
  predictionService,
  dashboardService,
  mlService,
  dataService,
};