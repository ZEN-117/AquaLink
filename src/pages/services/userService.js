import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const userApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
userApi.interceptors.request.use(
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

// Add response interceptor for error handling
userApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userData');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

export const userService = {
  // Get all users with pagination and filters
  getUsers: async (params = {}) => {
    const { page = 1, limit = 10, search = '', role = '', status = '' } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(role && { role }),
      ...(status && { status }),
    });

    const response = await userApi.get(`/users?${queryParams}`);
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId) => {
    const response = await userApi.get(`/users/${userId}`);
    return response.data;
  },

  // Create new user
  createUser: async (userData) => {
    const response = await userApi.post('/users', userData);
    return response.data;
  },

  // Update user
  updateUser: async (userId, userData) => {
    const response = await userApi.put(`/users/${userId}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await userApi.delete(`/users/${userId}`);
    return response.data;
  },

  // Suspend/Activate user
  toggleUserStatus: async (userId, status) => {
    const response = await userApi.patch(`/users/${userId}/status`, { status });
    return response.data;
  },

  // Update user role
  updateUserRole: async (userId, role) => {
    const response = await userApi.patch(`/users/${userId}/role`, { role });
    return response.data;
  },

  // Get user statistics
  getUserStats: async () => {
    const response = await userApi.get('/users/stats');
    return response.data;
  },

  // Bulk operations
  bulkDeleteUsers: async (userIds) => {
    const response = await userApi.post('/users/bulk-delete', { userIds });
    return response.data;
  },

  bulkUpdateStatus: async (userIds, status) => {
    const response = await userApi.post('/users/bulk-status', { userIds, status });
    return response.data;
  },

  bulkUpdateRole: async (userIds, role) => {
    const response = await userApi.post('/users/bulk-role', { userIds, role });
    return response.data;
  },
};

export default userService;
