import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
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
  const [districts, setDistricts] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(true);

  const { register } = useAuth();
  const navigate = useNavigate();

  // 🔄 İlçe listesini backend'den çek
  useEffect(() => {
    const loadDistricts = async () => {
      try {
        const response = await api.get('/districts');
        console.log('📍 Districts response:', response.data);
        
        // Backend response formatına göre ayarla
        setDistricts(response.data.districts || response.data.data || []);
      } catch (error) {
        console.error('❌ İlçeler yüklenemedi:', error);
        // Fallback olarak boş array - statik veri YOK
        setDistricts([]);
      } finally {
        setLoadingDistricts(false);
      }
    };

    loadDistricts();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

 // 📱 Telefon değişimi (artık başa 0 eklemiyor)
const handlePhoneChange = (e) => {
  let numbers = e.target.value.replace(/\D/g, '').slice(0, 10); // 10 hane (başında 0 yok)
  
  let formatted = numbers;
  if (numbers.length > 3) formatted = `${numbers.slice(0,3)} ${numbers.slice(3)}`;
  if (numbers.length > 6) formatted = `${numbers.slice(0,3)} ${numbers.slice(3,6)} ${numbers.slice(6)}`;
  if (numbers.length > 8) formatted = `${numbers.slice(0,3)} ${numbers.slice(3,6)} ${numbers.slice(6,8)} ${numbers.slice(8)}`;
  
  setFormData(prev => ({ ...prev, phone: formatted }));
};


  const handleSubmit = async (e) => {
  e.preventDefault();
  const { name, surname, phone, email, password, profession, skills, districtId } = formData;

  if (!name || !surname || !phone || !email || !password || !profession || !skills || !districtId) {
    setError('Lütfen tüm alanları doldurunuz.');
    return;
  }

  // 10 haneli, 0’sız numara (örnek: 555 123 45 67)
  const phoneRegex = /^\d{3} \d{3} \d{2} \d{2}$/;
  if (!phoneRegex.test(phone)) {
    setError('Telefon numarası doğru formatta olmalıdır (XXX XXX XX XX).');
    return;
  }

  const cleanPhone = phone.replace(/\s/g, ''); // "5551234567"

  setIsLoading(true);
  setError(null);

  try {
    const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s.length > 0);

    const result = await register({ 
      name, 
      surname, 
      phone: cleanPhone, // ✅ artık 0’sız ve boşluksuz
      email, 
      password, 
      profession, 
      skills: skillsArray, 
      districtId: parseInt(districtId), 
      role: 'GONULLU' 
    });
    
    if (result.success) {
      alert('✅ Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz.');
      navigate('/login');
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-red-600">
            <img 
              src="/vite.jpg"
              alt="Zafer Partisi Logo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Kayıt Ol
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Üyeler ve gönüllüler için kayıt formu
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className={`px-4 py-3 rounded-md text-sm ${
                error.includes('✅') 
                  ? 'bg-green-50 border border-green-200 text-green-600' 
                  : 'bg-red-50 border border-red-200 text-red-600'
              }`}>
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Ad *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="Adınız"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Soyad *</label>
                <input
                  type="text"
                  name="surname"
                  value={formData.surname}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="Soyadınız"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Telefon *</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="0XXX XXX XX XX"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">Örnek: 0555 123 45 67</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">E-posta *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="ornek@mail.com"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Şifre *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="En az 6 karakter"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Meslek *</label>
              <input
                type="text"
                name="profession"
                value={formData.profession}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="Örn: Mühendis, Öğretmen, Öğrenci"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Yetenekler *</label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="Örn: Grafik Tasarım, Muhasebe, Halkla İlişkiler"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">Birden fazla yetenek için virgül kullanın</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">İlçe *</label>
              <select
                name="districtId"
                value={formData.districtId}
                onChange={handleChange}
                required
                disabled={loadingDistricts || districts.length === 0}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm disabled:bg-gray-100"
              >
                <option value="">
                  {loadingDistricts 
                    ? 'İlçeler yükleniyor...' 
                    : districts.length === 0 
                      ? 'İlçe listesi yüklenemedi' 
                      : 'İlçe seçiniz'
                  }
                </option>
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
              {districts.length === 0 && !loadingDistricts && (
                <p className="mt-1 text-xs text-red-500">
                  İlçe listesi yüklenemedi. Lütfen sayfayı yenileyin veya yönetici ile iletişime geçin.
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || loadingDistricts || districts.length === 0}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Zaten hesabınız var mı?{' '}
              <button
                onClick={() => navigate('/login')}
                className="font-medium text-red-600 hover:text-red-500 focus:outline-none focus:underline transition-colors duration-200"
              >
                Giriş yapın
              </button>
            </p>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-700 text-center">
              📝 <strong>Not:</strong> İlçe başkanları sisteme yalnızca yönetim tarafından eklenir. 
              Üyeler ve gönüllüler bu form ile kayıt olabilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;