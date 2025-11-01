import api from './api';

export const userService = {
  // Kullanıcıları getir
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Tekil kullanıcı getir
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Yeni kullanıcı oluştur
  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Kullanıcı güncelle
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Kullanıcı sil (pasifleştir)
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Kullanıcı istatistiklerini getir
  getUserStats: async (params = {}) => {
    const response = await api.get('/users/stats', { params });
    return response.data;
  },

  // Kullanıcı görevlerini getir
  getUserTasks: async (userId, params = {}) => {
    const response = await api.get(`/users/${userId}/tasks`, { params });
    return response.data;
  }
};