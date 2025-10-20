import axios from 'axios';
import { API_CONFIG } from '../config/api.config';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  verifyToken: () => api.post('/auth/verify-token')
};

// Quiz API functions
export const quizAPI = {
  getQuizzes: (params) => api.get('/quiz', { params }),
  getMyQuizzes: (params) => api.get('/quiz/my-quizzes', { params }),
  getQuiz: (id, includeAnswers = false) => api.get(`/quiz/${id}`, { 
    params: { includeAnswers } 
  }),
  getQuizById: (id) => api.get(`/quiz/${id}`),
  createQuiz: (data) => api.post('/quiz', data),
  updateQuiz: (id, data) => api.put(`/quiz/${id}`, data),
  deleteQuiz: (id) => api.delete(`/quiz/${id}`),
  togglePrivacy: (id, isPublic) => api.patch(`/quiz/${id}/privacy`, { isPublic }),
  addQuestion: (quizId, data) => api.post(`/quiz/${quizId}/questions`, data),
  updateQuestion: (quizId, questionId, data) => 
    api.put(`/quiz/${quizId}/questions/${questionId}`, data),
  deleteQuestion: (quizId, questionId) => 
    api.delete(`/quiz/${quizId}/questions/${questionId}`)
};

// Result API functions
export const resultAPI = {
  submitQuiz: (data) => api.post('/result/submit', data),
  getResults: (params) => api.get('/result', { params }),
  getResult: (id) => api.get(`/result/${id}`),
  getQuizResults: (quizId, params) => api.get(`/result/quiz/${quizId}`, { params }),
  getUserResults: (userId, params) => api.get(`/result/user/${userId}`, { params }),
  deleteResult: (id) => api.delete(`/result/${id}`)
};

// Upload API functions
export const uploadAPI = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadVideo: (file) => {
    const formData = new FormData();
    formData.append('video', file);
    return api.post('/upload/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteFile: (publicId, resourceType = 'image') => 
    api.delete(`/upload/${publicId}`, { params: { resource_type: resourceType } }),
  listFiles: (params) => api.get('/upload/list', { params })
};

export default api;