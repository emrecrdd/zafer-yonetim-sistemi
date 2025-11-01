// Telefon numarasını formatla
export const formatPhone = (phone) => {
  if (!phone) return '';
  // Tüm boşluk ve özel karakterleri kaldır
  return phone.replace(/\D/g, '');
};

// İsim formatı (Baş harfler büyük)
export const formatName = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Local storage helper'ları
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return localStorage.getItem(key);
    }
  },
  
  set: (key, value) => {
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error('Storage set error:', error);
    }
  },
  
  remove: (key) => {
    localStorage.removeItem(key);
  },
  
  clear: () => {
    localStorage.clear();
  }
};

// Error handler
export const handleApiError = (error) => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  return error.message || 'Bir hata oluştu';
};

// Loading state için gecikme
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));