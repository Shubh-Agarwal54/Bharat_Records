import axios from 'axios';

// API Base URL - Update this when deploying
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Authentication APIs
export const authAPI = {
  // Email/Password Signup
  signup: async (data) => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  // Email/Password Login
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Phone Login (for future use)
  phoneLogin: async (mobile) => {
    const response = await api.post('/auth/phone-login', { mobile });
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (identifier, otp) => {
    // identifier can be email or mobile
    const payload = identifier.includes('@') 
      ? { email: identifier, otp }
      : { mobile: identifier, otp };
    const response = await api.post('/auth/verify-otp', payload);
    return response.data;
  },

  // Refresh Token
  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh-token', { refreshToken });
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Google OAuth
  googleAuth: async (credential) => {
    const response = await api.post('/auth/google', { credential });
    return response.data;
  },
};

// User APIs
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Update profile
  updateProfile: async (data) => {
    // If data is FormData, don't set Content-Type (let browser set it with boundary)
    const config = data instanceof FormData ? {
      headers: { 'Content-Type': 'multipart/form-data' }
    } : {};
    const response = await api.put('/users/profile', data, config);
    return response.data;
  },

  // Change password
  changePassword: async (oldPassword, newPassword) => {
    const response = await api.put('/users/change-password', {
      oldPassword,
      newPassword,
    });
    return response.data;
  },

  // Get referrals
  getReferrals: async () => {
    const response = await api.get('/users/referrals');
    return response.data;
  },
};

// Document APIs
export const documentAPI = {
  // Upload document
  upload: async (formData) => {
    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get all documents
  getAll: async (category, documentType) => {
    const response = await api.get('/documents', {
      params: { category, documentType },
    });
    return response.data;
  },

  // Get document by ID
  getById: async (id) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  // Update document
  update: async (id, data) => {
    const response = await api.put(`/documents/${id}`, data);
    return response.data;
  },

  // Delete document
  delete: async (id) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },

  // Get document statistics
  getStats: async () => {
    const response = await api.get('/documents/stats/categories');
    return response.data;
  },

  // Get download URL
  getDownloadUrl: async (id) => {
    const response = await api.get(`/documents/${id}/download`);
    return response.data;
  },
};

// Wallet APIs
export const walletAPI = {
  // Get wallet details
  getWallet: async () => {
    const response = await api.get('/wallet');
    return response.data;
  },

  // Add money
  addMoney: async (amount, paymentMethod, transactionId) => {
    const response = await api.post('/wallet/add-money', {
      amount,
      paymentMethod,
      transactionId,
    });
    return response.data;
  },

  // Transfer money
  transfer: async (recipientId, amount, note) => {
    const response = await api.post('/wallet/transfer', {
      recipientId,
      amount,
      note,
    });
    return response.data;
  },

  // Withdraw money
  withdraw: async (amount, bankDetails) => {
    const response = await api.post('/wallet/withdraw', {
      amount,
      bankDetails,
    });
    return response.data;
  },
};

// Transaction APIs
export const transactionAPI = {
  // Get all transactions
  getAll: async (type, status, page = 1, limit = 20) => {
    const response = await api.get('/transactions', {
      params: { type, status, page, limit },
    });
    return response.data;
  },

  // Get transaction by ID
  getById: async (id) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  // Get transaction statistics
  getStats: async () => {
    const response = await api.get('/transactions/stats/summary');
    return response.data;
  },
};

export default api;
