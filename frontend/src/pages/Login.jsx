import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, error, setError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    setError(null);
  }, [formData, setError]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(formData.phone, formData.password);
    
    if (result.success) {
      navigate(from, { replace: true });
    }
    
    setIsLoading(false);
  };

  const formatPhoneInput = (value) => {
    // Telefon numarasını formatla (555 555 55 55)
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      const match = numbers.match(/^(\d{3})(\d{3})(\d{2})(\d{2})$/);
      if (match) {
        return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
      }
    }
    return value;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneInput(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
       <div className="flex justify-center">
  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-red-600">
    <img 
      src="/zafer.png"   // public klasöründe logo.png olmalı
      alt="Zafer Partisi Logo"
      className="w-full h-full object-cover"
    />
  </div>
</div>

        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Zafer Partisi Yönetim Sistemi
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Lütfen hesabınıza giriş yapın
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Telefon Numarası
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="555 555 55 55"
                  required
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Şifre
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Sistem Bilgisi</span>
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500 space-y-2">
  <p>
    Henüz hesabınız yoksa, üyeler ve gönüllülerimiz <a href="/register" className="text-red-600 hover:text-red-700 font-medium">buradan kayıt olabilir</a>.
  </p>
  
  <p>
    Kayıt sırasında adınız, soyadınız, telefon numaranız, mesleğiniz ve yetenekleriniz istenecektir. Bu bilgiler, görev dağıtımı ve proje yönetiminde kullanılacaktır.
  </p>
  <p>
    Lütfen bilgilerinizi eksiksiz ve doğru giriniz.
  </p>
</div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
