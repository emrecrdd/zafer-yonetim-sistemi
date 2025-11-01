import api from './api';

export const attendanceService = {
  // Katılım durumu güncelle
  updateAttendance: async (eventId, status) => {
    const response = await api.put(`/attendances/events/${eventId}/attendance`, { status });
    return response.data;
  },

  // Etkinlik katılımcılarını getir
  getEventAttendances: async (eventId) => {
    const response = await api.get(`/attendances/events/${eventId}/attendances`);
    return response.data;
  },

  // Kullanıcı katılımlarını getir
  getUserAttendances: async (userId, params = {}) => {
    const response = await api.get(`/attendances/users/${userId}/attendances`, { params });
    return response.data;
  },

  // Katılım istatistiklerini getir
  getAttendanceStats: async (eventId) => {
    const response = await api.get(`/attendances/events/${eventId}/attendance-stats`);
    return response.data;
  }
};