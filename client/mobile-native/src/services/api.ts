import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:3000'; // Adjust based on your setup

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      AsyncStorage.removeItem('authToken');
      // Navigate to login screen
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),

  register: (userData: { email: string; password: string; name: string }) =>
    api.post('/auth/register', userData),

  getProfile: () => api.get('/auth/profile'),

  updateProfile: (profileData: any) => api.put('/auth/profile', profileData),
};

export const matchAPI = {
  getPotentialMatches: (filters?: any) =>
    api.get('/matches/potential', { params: filters }),

  likeUser: (userId: string) => api.post('/matches/like', { userId }),

  passUser: (userId: string) => api.post('/matches/pass', { userId }),

  getMatches: () => api.get('/matches'),

  getMatchDetails: (matchId: string) => api.get(`/matches/${matchId}`),
};

export const paymentAPI = {
  createPaymentIntent: (data: { amount: number; currency?: string; itemType: string; itemId?: string }) =>
    api.post('/payments/create-payment-intent', data),

  createSubscription: (data: { planType: 'PREMIUM' | 'GOLD'; paymentMethodId: string }) =>
    api.post('/payments/create-subscription', data),

  purchaseItem: (data: { itemType: string; itemId: string; paymentMethodId: string }) =>
    api.post('/payments/purchase-item', data),

  getSubscriptionStatus: () => api.get('/payments/subscription-status'),

  cancelSubscription: () => api.post('/payments/cancel-subscription'),

  getTransactionHistory: () => api.get('/payments/transaction-history'),
};

export const profileAPI = {
  getProfile: (userId?: string) => api.get(userId ? `/profile/${userId}` : '/profile'),

  updateProfile: (profileData: any) => api.put('/profile', profileData),

  uploadPhoto: (photoData: FormData) =>
    api.post('/profile/upload-photo', photoData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deletePhoto: (photoId: string) => api.delete(`/profile/photo/${photoId}`),

  updatePreferences: (preferences: any) => api.put('/profile/preferences', preferences),
};

export default api;
