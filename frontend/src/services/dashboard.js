import api from './api';

export const dashboardService = {
  // Dashboard istatistiklerini getir
  getStats: async (districtId = null) => {
    const params = districtId ? { districtId } : {};
    const response = await api.get('/dashboard/stats', { params });
    return response.data;
  },

  // Admin dashboard istatistiklerini getir
  getAdminStats: async () => {
    const response = await api.get('/dashboard/admin-stats');
    return response.data;
  }
};