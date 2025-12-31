import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    phone: '',
    email: '',
    password: '',
    profession: '',
    skills: '',
    districtId: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '' });

  const { register } = useAuth();
  const navigate = useNavigate();

  // 🔄 İlçe listesini backend'den çek
  useEffect(() => {
    const loadDistricts = async () => {
      try {
        const response = await api.get('/districts');
        console.log('📍 Districts response:', response.data);
        
        setDistricts(response.data.districts || response.data.data || []);
      } catch (error) {
        console.error('❌ İlçeler yüklenemedi:', error);
        setDistricts([]);
      } finally {
        setLoadingDistricts(false);
      }
    };

    loadDistricts();
  }, []);

  // Şifre gücü hesaplama
  useEffect(() => {
    const calculateStrength = () => {
      if (!formData.password) return { score: 0, text: '' };
      
      let score = 0;
      if (formData.password.length >= 6) score++;
      if (formData.password.length >= 8) score++;
      if (/[A-Z]/.test(formData.password)) score++;
      if (/\d/.test(formData.password)) score++;
      if (/[^A-Za-z0-9]/.test(formData.password)) score++;
      
      const levels = ['Zayıf', 'Orta', 'İyi', 'Güçlü', 'Çok Güçlü'];
      return { score, text: levels[score - 1] || '' };
    };
    
    setPasswordStrength(calculateStrength());
  }, [formData.password]);

  // Telefon formatlama
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

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneInput(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, surname, phone, email, password, profession, skills, districtId } = formData;

    if (!name || !surname || !phone || !email || !password || !profession || !skills || !districtId) {
      setError('Lütfen tüm alanları doldurunuz.');
      return;
    }

    const phoneRegex = /^\d{3} \d{3} \d{2} \d{2}$/;
    if (!phoneRegex.test(phone)) {
      setError('Telefon numarası doğru formatta olmalıdır (XXX XXX XX XX).');
      return;
    }

    const cleanPhone = phone.replace(/\s/g, '');

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s.length > 0);

      const result = await register({ 
        name, 
        surname, 
        phone: cleanPhone,
        email, 
        password, 
        profession, 
        skills: skillsArray, 
        districtId: parseInt(districtId), 
        role: 'GONULLU' 
      });
      
      if (result.success) {
        setSuccess('✅ Zafer ailesine hoş geldiniz! Giriş sayfasına yönlendiriliyorsunuz...');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(result.error || 'Kayıt işlemi başarısız oldu.');
      }
    } catch (error) {
      console.error('❌ Register error:', error);
      setError('Kayıt işlemi sırasında bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

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
            "Güçlü Türkiye, Birlikte Zafer."
          </p>
          <div className="flex justify-center items-center gap-4 mt-4 flex-wrap">
            <span className="px-4 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">🤝 Gönüllü Ağı</span>
            <span className="px-4 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">🏛️ Teşkilatlanma</span>
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
          {/* Kayıt Formu */}
          <motion.div 
            className="lg:w-2/3"
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      Zafer Teşkilatına Katılın
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Türkiye'nin Geleceği İçin Bir Adım Atın
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
                  
                  {success && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mb-8 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg shadow-sm"
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-green-700 font-medium">{success}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Ad Soyad */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        <span className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          Adınız
                          <span className="text-red-500">*</span>
                        </span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300"
                        placeholder="Adınızı giriniz"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        <span className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          Soyadınız
                          <span className="text-red-500">*</span>
                        </span>
                      </label>
                      <input
                        type="text"
                        name="surname"
                        value={formData.surname}
                        onChange={handleChange}
                        required
                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300"
                        placeholder="Soyadınızı giriniz"
                      />
                    </div>
                  </div>

                  {/* Telefon ve Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        <span className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                          Telefon
                          <span className="text-red-500">*</span>
                        </span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 text-lg">+90</span>
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handlePhoneChange}
                          placeholder="555 555 55 55"
                          required
                          className="pl-16 w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300"
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        📞 Başında 0 olmadan 10 haneli giriniz
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        <span className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                          E-posta
                          <span className="text-red-500">*</span>
                        </span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="ornek@mail.com"
                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300"
                      />
                    </div>
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
                        {showPassword ? '🔒 Gizle' : '👁️ Göster'}
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={6}
                        className="pl-10 w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300"
                        placeholder="En az 6 karakter"
                      />
                    </div>
                    
                    {/* Şifre Gücü Göstergesi */}
                    {formData.password && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Zafer Gücü:</span>
                          <span className={`font-bold ${
                            passwordStrength.score >= 4 ? 'text-green-600' :
                            passwordStrength.score >= 3 ? 'text-blue-600' :
                            passwordStrength.score >= 2 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {passwordStrength.text}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${passwordStrength.score * 20}%` }}
                            className={`h-full ${
                              passwordStrength.score >= 4 ? 'bg-green-500' :
                              passwordStrength.score >= 3 ? 'bg-blue-500' :
                              passwordStrength.score >= 2 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                          />
                        </div>
                        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                          <div className={`flex items-center gap-1 text-xs ${formData.password.length >= 6 ? 'text-green-600' : 'text-gray-400'}`}>
                            {formData.password.length >= 6 ? '✅' : '○'} 6+ karakter
                          </div>
                          <div className={`flex items-center gap-1 text-xs ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                            {/[A-Z]/.test(formData.password) ? '✅' : '○'} Büyük harf
                          </div>
                          <div className={`flex items-center gap-1 text-xs ${/\d/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                            {/\d/.test(formData.password) ? '✅' : '○'} Rakam
                          </div>
                          <div className={`flex items-center gap-1 text-xs ${/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                            {/[^A-Za-z0-9]/.test(formData.password) ? '✅' : '○'} Özel karakter
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Meslek ve Yetenekler */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        <span className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                          Meslek
                          <span className="text-red-500">*</span>
                        </span>
                      </label>
                      <input
                        type="text"
                        name="profession"
                        value={formData.profession}
                        onChange={handleChange}
                        required
                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300"
                        placeholder="Örn: Mühendis, Öğretmen, Öğrenci"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        <span className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
                          </svg>
                          Yetenekler
                          <span className="text-red-500">*</span>
                        </span>
                      </label>
                      <input
                        type="text"
                        name="skills"
                        value={formData.skills}
                        onChange={handleChange}
                        placeholder="Grafik Tasarım, Muhasebe"
                        required
                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300"
                      />
                      <p className="mt-2 text-sm text-gray-600">
                        ✍️ Birden fazla yetenek için virgül (,) kullanın
                      </p>
                    </div>
                  </div>

                  {/* İlçe Seçimi */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <span className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        İlçe
                        <span className="text-red-500">*</span>
                      </span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <select
                        name="districtId"
                        value={formData.districtId}
                        onChange={handleChange}
                        required
                        disabled={loadingDistricts || districts.length === 0}
                        className="pl-10 w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {loadingDistricts 
                            ? 'İlçeler yükleniyor...' 
                            : districts.length === 0 
                              ? 'İlçe listesi yüklenemedi' 
                              : 'İlçenizi seçiniz'
                          }
                        </option>
                        {districts.map((district) => (
                          <option key={district.id} value={district.id}>
                            {district.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {districts.length === 0 && !loadingDistricts && (
                      <p className="mt-2 text-sm text-red-600">
                        ⚠️ İlçe listesi yüklenemedi. Lütfen sayfayı yenileyin veya yönetici ile iletişime geçin.
                      </p>
                    )}
                  </div>

                  {/* Kayıt Butonu */}
                  <div className="pt-4">
                    <motion.button
                      type="submit"
                      disabled={isLoading || loadingDistricts || districts.length === 0}
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
                          <span className="font-bold">KAYIT YAPILIYOR...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-6 h-6 mr-3 transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                          <span className="text-lg font-bold tracking-wide">Zafer Teşkilatına Katılın</span>
                        </>
                      )}
                    </motion.button>
                    <p className="mt-4 text-center text-sm text-gray-600">
                      🔒 Bilgileriniz 5651 sayılı kanun kapsamında korunmaktadır.
                    </p>
                  </div>
                </form>

                {/* Giriş Linki */}
                <div className="mt-12 pt-8 border-t border-gray-200 text-center relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-4">
                    <span className="text-gray-500 text-sm">YA DA</span>
                  </div>
                  <p className="text-base text-gray-700 font-medium">
                    Zaten teşkilatımızın bir üyesi misiniz?{' '}
                    <Link 
                      to="/login" 
                      className="font-bold text-red-600 hover:text-red-800 transition inline-flex items-center gap-1"
                    >
                      <span>GİRİŞ YAPIN</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bilgi Paneli */}
          <motion.div 
            className="lg:w-1/3"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl shadow-2xl overflow-hidden text-white h-full sticky top-6">
              <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-transparent to-blue-900/10"></div>
              
              <div className="relative p-8 h-full">
                <div className="flex items-center mb-8">
                  <div className="p-3 bg-gradient-to-r from-red-600 to-red-800 rounded-xl mr-4 shadow-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold">Zafer Teşkilatı Nedir?</h2>
                </div>

                <div className="space-y-6">
                  <div className="p-4 bg-gradient-to-r from-red-900/20 to-black/20 rounded-xl border border-red-800/30">
                    <h3 className="font-bold text-red-300 mb-2 flex items-center gap-2">
                      <span className="text-yellow-400">🎯</span> Hedefimiz
                    </h3>
                    <p className="text-sm text-gray-300">
                      2028 hedefine ulaşmak için her ilçede aktif teşkilatlanma ve milletimizle birlikte çalışmak.
                    </p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-red-900/20 to-black/20 rounded-xl border border-red-800/30">
                    <h3 className="font-bold text-red-300 mb-2 flex items-center gap-2">
                      <span className="text-green-400">🤝</span> Gönüllü Hakları
                    </h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">•</span>
                        <span>Eğitim ve gelişim programları</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">•</span>
                        <span>Görev ve sorumluluk dağılımı</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">•</span>
                        <span>Kariyer gelişim fırsatları</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-red-900/20 to-black/20 rounded-xl border border-red-800/30">
                    <h3 className="font-bold text-red-300 mb-2 flex items-center gap-2">
                      <span className="text-blue-400">📋</span> Kayıt Sonrası
                    </h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">①</span>
                        <span>İlçe başkanlığı onayı</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">②</span>
                        <span>Gönüllü eğitimleri</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">③</span>
                        <span>Görev atamaları</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Zafer Sloganları */}
                <div className="mt-8">
                  <h3 className="font-bold text-red-700 mb-4 flex items-center gap-2 text-lg">
                    <span className="text-yellow-400">🎙️</span> "Güçlü Türkiye, Birlikte Zafer."
                  </h3>
                  <div className="space-y-3">
                    {[
                      "Millî Duruş, Tek Yürek",
                      "Gençlik ve Teşkilatlanma",
                      "Milletle El Ele",
                      "Hedef 2028: Her İlçede Aktif Çalışma",
                    ].map((slogan, index) => (
                      <motion.div
                        key={index}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-red-900/20 rounded-lg p-3 text-center border border-red-800/20 hover:border-red-700/30 transition cursor-pointer hover:scale-[1.01]"
                      >
                        <span className="text-white/90 font-medium">{slogan}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Önemli Not */}
                <div className="mt-8 p-4 bg-gradient-to-r from-red-900/30 to-black/40 rounded-xl border border-red-800/30">
                  <div className="flex items-start">
                    <div className="p-2 bg-red-700 rounded-lg mr-3 flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.342 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-300">
                        <strong>Not:</strong> İlçe başkanları sisteme yalnızca yönetim tarafından eklenir. 
                        Üyeler ve gönüllüler bu form ile kayıt olabilir.
                      </p>
                    </div>
                  </div>
                </div>

                {/* İletişim */}
                <div className="mt-6 pt-6 border-t border-gray-800 text-center">
                  <p className="text-xs text-gray-400 mb-2 font-semibold">📞 İletişim</p>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-300">0553 793 4281</p>
                    <p className="text-xs text-gray-400">info@zaferpartisi.org.tr</p>
                    <p className="text-xs text-gray-500 mt-1">Her türlü soru ve destek için bize ulaşabilirsiniz.</p>
                  </div>
                  
                  {/* WhatsApp Hızlı Erişim */}
               
<div className="mt-4">
  <a 
    href="https://wa.me/905537934281?text=Merhaba,%20Zafer%20Partisi%20dijital%20sistemiyle%20ilgili%20bir%20sorunu%20bildirmek%20istiyorum."
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors duration-200"
    
  >
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.032 12.558c-.332.002-.64.175-.814.456-.174.28-.19.63-.042.924.148.293.43.484.744.511.314.027.62-.111.817-.367.197-.256.258-.593.165-.905-.094-.312-.343-.556-.647-.619-.183-.038-.37-.022-.543.045l.275.1zm3.142-2.242c-.41-.207-.85-.307-1.291-.297-.441.01-.877.13-1.269.35-.392.221-.726.535-.975.915-.25.38-.407.816-.458 1.27-.051.455.007.914.169 1.342.163.428.425.811.766 1.12.34.308.749.534 1.194.66.446.125.914.146 1.369.062.455-.084.882-.272 1.248-.549.366-.277.661-.634.861-1.046.2-.411.298-.863.287-1.318-.011-.455-.102-.903-.265-1.318-.164-.415-.396-.786-.684-1.09-.288-.305-.626-.536-.998-.678l-.355.711z" />
      <path d="M20.52 3.48C18.24 1.2 15.24 0 12 0S5.76 1.2 3.48 3.48C1.2 5.76 0 8.76 0 12s1.2 6.24 3.48 8.52c2.28 2.28 5.28 3.48 8.52 3.48s6.24-1.2 8.52-3.48c2.28-2.28 3.48-5.28 3.48-8.52s-1.2-6.24-3.48-8.52zm-8.488 16.04c-1.691 0-3.381-.43-4.881-1.29l-5.41 1.44 1.44-5.41c-.86-1.5-1.29-3.19-1.29-4.88 0-4.14 3.37-7.51 7.51-7.51 2.01 0 3.89.78 5.31 2.2 1.42 1.42 2.2 3.3 2.2 5.31 0 4.14-3.37 7.51-7.51 7.51z" />
    </svg>
    <span className="text-sm font-medium">Sistemdeki Sorunu WhatsApp'tan Bildir</span>
  </a>
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
              "Her Gönüllü, Bir Zafer Mimarıdır!"
            </p>
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
          </div>
          <p className="text-sm text-gray-600 font-medium">
            © {new Date().getFullYear()} Zafer Partisi Dijital Yönetim Merkezi | 
            Tüm hakları Zafer Partisi'ne aittir.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Register;