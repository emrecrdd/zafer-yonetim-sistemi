import api from './api';

export const authService = {
  // Giriş yap
  login: async (phone, password) => {
    const response = await api.post('/auth/login', { phone, password });
    return response.data;
  },

  // Yeni kullanıcı kaydı (İlçe başkanı için)
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Profil bilgilerini getir
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Profili güncelle
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  // Şifre değiştir
  changePassword: async (passwordData) => {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  },

  // Çıkış yap
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};