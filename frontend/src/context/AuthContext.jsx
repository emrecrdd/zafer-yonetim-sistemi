import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        
        // Profili kontrol et (opsiyonel)
        try {
          const profileResponse = await authService.getProfile();
          setUser(profileResponse.user);
        } catch (profileError) {
          console.log('Profile check failed, using saved user data');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (phone, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authService.login(phone, password);
      
      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        setLoading(false);
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Giriş başarısız';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await authService.register(userData);
      
      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Kayıt başarısız';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
    localStorage.setItem('user', JSON.stringify({ ...user, ...userData }));
  };

  const clearError = () => setError(null);

 // AuthContext.jsx - rol kontrol fonksiyonlarını güncelle:

// ✅ ROL KONTROL FONKSİYONLARI - TÜM ROLLERİ EKLE
const isSuperAdmin = user?.role === 'super_admin';
const isIlBaskani = user?.role === 'IL_BASKANI' || isSuperAdmin; // Super admin tüm yetkilere sahip
const isIlceBaskani = user?.role === 'ILCE_BASKANI' || isSuperAdmin;
const isGonullu = user?.role === 'GONULLU';

const value = {
  user,
  loading,
  error,
  login,
  register,
  logout,
  updateUser,
  setError: clearError,
  isAuthenticated: !!user,
  
  // ✅ TÜM ROL KONTROLLERİ
  isSuperAdmin,
  isIlBaskani,
  isIlceBaskani, 
  isGonullu
};

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};