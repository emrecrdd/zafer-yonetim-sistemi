import api from './api';

export const taskService = {
  // Görevleri getir
  getTasks: async (params = {}) => {
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  // Tekil görev getir
  getTaskById: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  // Yeni görev oluştur
  createTask: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  // Görev güncelle
  updateTask: async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  // Görev sil
  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  // Kullanıcı görevlerini getir
  getUserTasks: async (userId, params = {}) => {
    const response = await api.get(`/tasks/user/${userId}`, { params });
    return response.data;
  }
};