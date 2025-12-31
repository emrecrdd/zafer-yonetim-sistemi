import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  // State management
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Context & routing hooks
  const { 
    login, 
    error, 
    setError, 
    isAuthenticated
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  // Authentication redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Error reset on form change
  useEffect(() => {
    if (error) setError(null);
  }, [formData, setError]);

  // Session persistence
  useEffect(() => {
    const savedPhone = localStorage.getItem('rememberedPhone');
    if (savedPhone) {
      setFormData(prev => ({ ...prev, phone: savedPhone }));
      setRememberMe(true);
    }
  }, []);

  // Phone formatting
  const formatPhoneInput = (value) => {
    const numbers = value.replace(/\D/g, '').substring(0, 10);
    
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `${numbers.substring(0, 3)} ${numbers.substring(3)}`;
    } else {
      return `${numbers.substring(0, 3)} ${numbers.substring(3, 6)} ${numbers.substring(6, 8)} ${numbers.substring(8, 10)}`;
    }
  };

  // Form input handlers
  const handlePhoneChange = (e) => {
    const formatted = formatPhoneInput(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  const handlePasswordChange = (e) => {
    setFormData(prev => ({ ...prev, password: e.target.value }));
  };

  // Main login handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.phone || !formData.password) {
      setError('Lütfen telefon numarası ve şifre giriniz');
      return;
    }

    // Telefon numarasını temizle
    const cleanPhone = formData.phone.replace(/\s/g, '');
    
    if (cleanPhone.length !== 10) {
      setError('Telefon numarası 10 haneli olmalıdır');
      return;
    }

    setIsLoading(true);
    
    // Remember me özelliği
    if (rememberMe) {
      localStorage.setItem('rememberedPhone', formData.phone);
    } else {
      localStorage.removeItem('rememberedPhone');
    }
    
    try {
      const result = await login(cleanPhone, formData.password);
      
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        console.log('❌ Login failed:', result.error);
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError('Giriş işlemi sırasında bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator
  const passwordStrength = () => {
    if (!formData.password) return { score: 0, text: '' };
    
    let score = 0;
    if (formData.password.length >= 6) score++;
    if (formData.password.length >= 8) score++;
    if (/[A-Z]/.test(formData.password)) score++;
    if (/\d/.test(formData.password)) score++;
    
    const levels = ['Zayıf', 'Orta', 'İyi', 'Güçlü'];
    return { score, text: levels[score - 1] || '' };
  };

  const strength = passwordStrength();

  return (
    <motion.div 
          className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* WhatsApp Butonu - Sağ Alt Köşe */}
          <motion.a
        href="https://wa.me/905537934281?text=Merhaba,%20Zafer%20Partisi%20dijital%20sistemiyle%20ilgili%20bir%20sorunu%20bildirmek%20istiyorum."
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1, type: "spring", stiffness: 100 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative">
              {/* WhatsApp Baloncuğu */}
              <div className="absolute -top-10 -right-2 bg-white rounded-lg shadow-xl p-3 w-64 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">WhatsApp Destek</p>
                    <p className="text-xs text-gray-600">Sorularınız için buradayız!</p>
                  </div>
                </div>
                <div className="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-3 h-3 bg-white"></div>
              </div>
    
              {/* WhatsApp Ana Buton */}
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-2xl flex items-center justify-center hover:shadow-green-300/50 transition-all duration-300 group">
                <div className="relative">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.032 12.558c-.332.002-.64.175-.814.456-.174.28-.19.63-.042.924.148.293.43.484.744.511.314.027.62-.111.817-.367.197-.256.258-.593.165-.905-.094-.312-.343-.556-.647-.619-.183-.038-.37-.022-.543.045l.275.1zm3.142-2.242c-.41-.207-.85-.307-1.291-.297-.441.01-.877.13-1.269.35-.392.221-.726.535-.975.915-.25.38-.407.816-.458 1.27-.051.455.007.914.169 1.342.163.428.425.811.766 1.12.34.308.749.534 1.194.66.446.125.914.146 1.369.062.455-.084.882-.272 1.248-.549.366-.277.661-.634.861-1.046.2-.411.298-.863.287-1.318-.011-.455-.102-.903-.265-1.318-.164-.415-.396-.786-.684-1.09-.288-.305-.626-.536-.998-.678l-.355.711z" />
                    <path d="M20.52 3.48C18.24 1.2 15.24 0 12 0S5.76 1.2 3.48 3.48C1.2 5.76 0 8.76 0 12s1.2 6.24 3.48 8.52c2.28 2.28 5.28 3.48 8.52 3.48s6.24-1.2 8.52-3.48c2.28-2.28 3.48-5.28 3.48-8.52s-1.2-6.24-3.48-8.52zm-8.488 16.04c-1.691 0-3.381-.43-4.881-1.29l-5.41 1.44 1.44-5.41c-.86-1.5-1.29-3.19-1.29-4.88 0-4.14 3.37-7.51 7.51-7.51 2.01 0 3.89.78 5.31 2.2 1.42 1.42 2.2 3.3 2.2 5.31 0 4.14-3.37 7.51-7.51 7.51z" />
                  </svg>
                  
                  {/* Animasyonlu çember */}
                  <div className="absolute inset-0 rounded-full border-4 border-green-300 border-opacity-30 animate-ping"></div>
                  <div className="absolute inset-0 rounded-full border-2 border-green-400 border-opacity-50 animate-pulse"></div>
                </div>
              </div>
    
              {/* Üzerine gelince yazı */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-xs font-semibold bg-gray-900 text-white px-2 py-1 rounded">Bize Yazın</span>
              </div>
            </div>
          </motion.a>
    
          <div className="sm:mx-auto sm:w-full sm:max-w-6xl">
            {/* Logo ve Başlık */}
            <motion.div 
              className="text-center mb-10"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-white-600 to-red-800 rounded-3xl shadow-2xl mb-6 transform hover:scale-105 transition-transform duration-300">
                <div className="relative">
                  <img 
                    src="/vite.jpg"
                    alt="Zafer Partisi Logo"
                    className="w-40 h-40"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23dc2626' rx='12'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='32' font-weight='bold'%3EZP%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  <div className="absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center transition-transform transform hover:scale-110 animate-pulse">
                    <svg viewBox="0 0 100 100" className="w-8 h-8">
                      <circle cx="50" cy="50" r="50" fill="#E30A17" />
                      <circle cx="45" cy="50" r="30" fill="white" />
                      <circle cx="62" cy="50" r="20" fill="#E30A17" />
                      <polygon
                        points="68,42 73,52 85,52 76,59 81,69 68,62 55,69 60,59 51,52 63,52"
                        fill="white"
                      />
                    </svg>
                  </div>
                </div>
              </div>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto font-semibold mb-2">
            "Türkiye'nin Zaferi İçin Hep Birlikte!"
          </p>
          <div className="flex justify-center items-center gap-4 mt-4 flex-wrap">
            <span className="px-4 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">★ Millî Duruş</span>
            <span className="px-4 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">⚔️ Tek Yürek</span>
            <span className="px-4 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">🎯 Hedef 2028</span>
            <span className="px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.032 12.558c-.332.002-.64.175-.814.456-.174.28-.19.63-.042.924.148.293.43.484.744.511.314.027.62-.111.817-.367.197-.256.258-.593.165-.905-.094-.312-.343-.556-.647-.619-.183-.038-.37-.022-.543.045l.275.1zm3.142-2.242c-.41-.207-.85-.307-1.291-.297-.441.01-.877.13-1.269.35-.392.221-.726.535-.975.915-.25.38-.407.816-.458 1.27-.051.455.007.914.169 1.342.163.428.425.811.766 1.12.34.308.749.534 1.194.66.446.125.914.146 1.369.062.455-.084.882-.272 1.248-.549.366-.277.661-.634.861-1.046.2-.411.298-.863.287-1.318-.011-.455-.102-.903-.265-1.318-.164-.415-.396-.786-.684-1.09-.288-.305-.626-.536-.998-.678l-.355.711z" />
                <path d="M20.52 3.48C18.24 1.2 15.24 0 12 0S5.76 1.2 3.48 3.48C1.2 5.76 0 8.76 0 12s1.2 6.24 3.48 8.52c2.28 2.28 5.28 3.48 8.52 3.48s6.24-1.2 8.52-3.48c2.28-2.28 3.48-5.28 3.48-8.52s-1.2-6.24-3.48-8.52zm-8.488 16.04c-1.691 0-3.381-.43-4.881-1.29l-5.41 1.44 1.44-5.41c-.86-1.5-1.29-3.19-1.29-4.88 0-4.14 3.37-7.51 7.51-7.51 2.01 0 3.89.78 5.31 2.2 1.42 1.42 2.2 3.3 2.2 5.31 0 4.14-3.37 7.51-7.51 7.51z" />
              </svg>
              WhatsApp Destek
            </span>
          </div>
          
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Giriş Formu */}
          <motion.div 
            className="lg:w-2/5"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden relative">
              {/* Bayrak efekti */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-white to-red-500"></div>
              
              <div className="px-10 py-12">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      Üye Girişi 
                    </h2>
                    <p className="text-gray-600 mt-1">
                       Türkiye İçin Harekete Geçin
                    </p>
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm"
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700 font-medium">{error}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Telefon Numarası */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <span className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        Telefon Numarası
                        <span className="text-red-500">*</span>
                      </span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-lg">+90</span>
                      </div>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        placeholder="555 555 55 55"
                        required
                        disabled={isLoading}
                        className="pl-16 w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 group-hover:border-red-300"
                      />
                    </div>
                    <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                      🇹🇷 Türk bayrağı gurur kaynağımız, iletişim gücümüzdür.
                    </p>
                  </div>

                  {/* Şifre */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-semibold text-gray-700">
                        <span className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                          Şifre
                          <span className="text-red-500">*</span>
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-sm font-medium text-red-600 hover:text-red-800 flex items-center gap-1 transition"
                      >
                        {showPassword ? (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                            Gizle
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Göster
                          </>
                        )}
                      </button>
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handlePasswordChange}
                        required
                        disabled={isLoading}
                        className="pl-10 w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 group-hover:border-red-300"
                        placeholder="Güçlü bir şifre oluşturun"
                      />
                    </div>
                    
                    {/* Şifre Gücü Göstergesi */}
                    {formData.password && strength.text && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Şifre Gücü:</span>
                          <span className={`font-bold ${
                            strength.score >= 3 ? 'text-green-600' :
                            strength.score >= 2 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {strength.text}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${strength.score * 25}%` }}
                            className={`h-full ${
                              strength.score >= 3 ? 'bg-green-500' :
                              strength.score >= 2 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                          />
                        </div>
                        <p className="mt-2 text-xs text-gray-600">
                          {strength.score >= 3 ? '✅ Mükemmel! Zafer kadar güçlü!' :
                           strength.score >= 2 ? '⚠️ İyi ama daha güçlü olabilir' :
                           '❌ Zayıf, lütfen güçlendirin'}
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="relative">
                        <input
                          id="remember-me"
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-red-600 peer-checked:border-red-600 flex items-center justify-center transition-all duration-200">
                          {rememberMe && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <label htmlFor="remember-me" className="ml-3 block text-sm font-medium text-gray-700">
                        Beni Hatırla
                      </label>
                    </div>

                    <Link 
                      to="/forgot-password" 
                      className="text-sm font-semibold text-red-600 hover:text-red-800 transition flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      Şifremi Unuttum
                    </Link>
                  </div>

                  {/* Giriş Butonu */}
                  <div>
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-xl text-white bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-700 hover:via-red-800 hover:to-red-900 focus:outline-none focus:ring-4 focus:ring-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 group"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span className="font-bold">ZAİM SİSTEMİNE GİRİŞ YAPILIYOR...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-6 h-6 mr-3 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                          <span className="text-lg font-bold tracking-wide"> GİRİŞ YAP</span>
                        </>
                      )}
                    </motion.button>
                    <p className="mt-4 text-center text-sm text-gray-600">
                      🔒 Güvenli bağlantı | SSL Aktif | 🇹🇷 Yerli Yazılım
                    </p>
                  </div>
                </form>

                {/* Kayıt Linki */}
                <div className="mt-12 pt-8 border-t border-gray-200 text-center relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-4">
                    <span className="text-gray-500 text-sm">YA DA</span>
                  </div>
                  <p className="text-base text-gray-700 font-medium">
                     Zafer teşkilatına katılmadınız mı?{' '}
                    <Link 
                      to="/register" 
                      className="font-bold text-red-600 hover:text-red-800 transition inline-flex items-center gap-1"
                    >
                      <span>HEMEN ÜYE OL</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bilgi Paneli - ZAİM Sistemi */}
          <motion.div 
            className="lg:w-3/5"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl shadow-2xl overflow-hidden text-white h-full relative">
              {/* Arka plan efekti */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-transparent to-blue-900/10"></div>
              
              <div className="relative p-10">
                {/* Başlık */}
                <div className="flex items-center mb-10">
                  <div className="p-3 bg-gradient-to-r from-red-600 to-red-800 rounded-xl mr-4 shadow-lg">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-2">
                      <span className="bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
                        ZDYM SİSTEMİ
                      </span>
                    </h2>
                    <p className="text-gray-300"> Zafer Partisi Dijital Yönetim Merkezi</p>
                  </div>
                  <div className="ml-auto">
                    <span className="px-4 py-2 bg-red-600/20 border border-red-500/30 rounded-full text-sm font-medium">
                      🎯 Hedef 2028
                    </span>
                  </div>
                </div>

                {/* Slogan Bölümü */}
                <div className="mb-12 p-6 bg-gradient-to-r from-red-900/30 to-red-800/20 rounded-2xl border border-red-800/30 backdrop-blur-sm">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-red-700 rounded-lg mr-4">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold">Zafer İçin Birlikte!</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-black/30 rounded-xl">
                      <div className="text-4xl font-bold text-red-300 mb-2">81</div>
                      <div className="text-gray-300">İlde Teşkilatlanma</div>
                    </div>
                    <div className="text-center p-4 bg-black/30 rounded-xl">
                      <div className="text-4xl font-bold text-red-300 mb-2">7/24</div>
                      <div className="text-gray-300">Aktif Çalışma</div>
                    </div>
                  </div>
                </div>

                {/* Sistem Özellikleri */}
                <div className="grid md:grid-cols-2 gap-10 mb-12">
                  <div>
                    <h3 className="text-xl font-bold mb-6 text-red-300 flex items-center gap-2">
                      <div className="w-2 h-8 bg-red-500 rounded-full"></div>
                      Millet İçin Hizmet
                    </h3>
                    <ul className="space-y-4">
                      {[
                        { icon: '👥', title: 'Halkla Doğrudan İletişim', desc: 'Türk milletinin sesini duyuyoruz' },
                        { icon: '🏛️', title: 'Yerel Yönetimler', desc: '81 ilde aktif teşkilatlanma' },
                        { icon: '🎯', title: 'Hedef Odaklı Çalışma', desc: '2028 hedefine doğru ilerliyoruz' },
                        { icon: '🤝', title: 'Gönüllü Ağı', desc: 'Binlerce gönüllüyle birlikte' }
                      ].map((item, index) => (
                        <motion.li 
                          key={index}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start p-3 bg-gray-900/50 rounded-xl hover:bg-gray-900/70 transition group"
                        >
                          <span className="text-2xl mr-3 group-hover:scale-110 transition-transform">{item.icon}</span>
                          <div>
                            <div className="font-semibold">{item.title}</div>
                            <div className="text-sm text-gray-400">{item.desc}</div>
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-6 text-red-300 flex items-center gap-2">
                      <div className="w-2 h-8 bg-red-500 rounded-full"></div>
                      Teknolojik Altyapı
                    </h3>
                    <ul className="space-y-4">
                      {[
                        { icon: '🔐', title: 'Güvenli Sistem', desc: 'A sınıfı şifreleme ve güvenlik' },
                        { icon: '📊', title: 'Anlık Raporlama', desc: 'Gerçek zamanlı veri analizi' },
                        { icon: '📱', title: 'Mobil Uyumlu', desc: 'Her cihazdan erişim imkanı' },
                        { icon: '⚡', title: 'Hızlı İletişim', desc: 'Anlık bildirim ve mesajlaşma' }
                      ].map((item, index) => (
                        <motion.li 
                          key={index}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.1 + 0.4 }}
                          className="flex items-start p-3 bg-gray-900/50 rounded-xl hover:bg-gray-900/70 transition group"
                        >
                          <span className="text-2xl mr-3 group-hover:scale-110 transition-transform">{item.icon}</span>
                          <div>
                            <div className="font-semibold">{item.title}</div>
                            <div className="text-sm text-gray-400">{item.desc}</div>
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Zafer Sloganları */}
                <div className="mb-10">
                  <h3 className="text-xl font-bold mb-6 text-red-300">Birlikte Zafer, Gelecek Bizim!</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      'Sesimiz bir, hedefimiz zirve!',
      'Güçlü millet, büyük Türkiye!',
      'Gençlik hazır, gelecek yıldız!',
      'Adalet yerinde, umut hep bizde!',
      'Omuz omuza, zafer yolunda!',
      'Birlikte yürür, düşleri büyütürüz!'
                    ].map((slogan, index) => (
                      <motion.div
                        key={index}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.05 + 0.8 }}
                        className="bg-gradient-to-r from-red-900/30 to-red-800/20 rounded-xl p-3 text-center border border-red-800/30 hover:border-red-700/50 transition cursor-pointer hover:scale-105"
                      >
                        <span className="text-sm font-medium">"{slogan}"</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Son Uyarı */}
                <div className="p-6 bg-gradient-to-r from-red-900/40 to-black/40 rounded-2xl border border-red-700/30 backdrop-blur-sm">
                  <div className="flex items-start">
                    <div className="p-3 bg-red-600 rounded-xl mr-4 shadow-lg flex-shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold mb-3">⚠️ Güvenlik Uyarısı</h4>
                      <p className="text-gray-300 mb-2">
                        Bu sistem sadece Zafer Partisi üyeleri ve gönüllüleri içindir. 
                        Bilgileriniz 5651 sayılı kanun kapsamında korunmaktadır.
                      </p>
                      <div className="flex items-center gap-4 mt-4">
                        <span className="px-3 py-1 bg-red-600/20 text-red-300 rounded-full text-xs">🇹🇷 Yerli Yazılım</span>
                        <span className="px-3 py-1 bg-red-600/20 text-red-300 rounded-full text-xs">🔒 SSL Şifreleme</span>
                        <span className="px-3 py-1 bg-red-600/20 text-red-300 rounded-full text-xs">🛡️ KVKK Uyumlu</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div 
          className="mt-12 text-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-6">
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
            <p className="text-lg font-bold text-gray-800">
              "Türkiye'nin Zafere İhtiyacı Var!"
            </p>
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
          </div>
          <p className="text-sm text-gray-600 font-medium">
            © {new Date().getFullYear()} Zafer Partisi Dijital Yönetim Merkezi - 
            Tüm hakları Zafer Partisi'ne aittir.
          </p>
          <div className="mt-4 flex justify-center gap-6">
            <span className="text-xs text-gray-500">📞 0553 793 4281</span>
            <span className="text-xs text-gray-500">✉️ info@zaferpartisi.org.tr</span>
             <span className="text-xs text-gray-500">🛎️ Her türlü soru ve destek için bize ulaşabilirsiniz.</span>
            <span className="text-xs text-gray-500">🏛️ Ankara, Türkiye</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;