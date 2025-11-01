import api from './api';

export const eventService = {
  // Etkinlikleri getir
  getEvents: async (params = {}) => {
    const response = await api.get('/events', { params });
    return response.data;
  },

  // Tekil etkinlik getir
  getEventById: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  // Yeni etkinlik oluştur
  createEvent: async (eventData) => {
    const response = await api.post('/events', eventData);
    return response.data;
  },

  // Etkinlik güncelle
  updateEvent: async (id, eventData) => {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
  },

  // Etkinlik sil
  deleteEvent: async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },

  // Katılım durumu güncelle
  updateAttendance: async (eventId, status) => {
    const response = await api.put(`/events/${eventId}/attendance`, { status });
    return response.data;
  },

  // Hatırlatma gönder
  sendReminders: async (eventId) => {
    const response = await api.post(`/events/${eventId}/reminders`);
    return response.data;
  }
};