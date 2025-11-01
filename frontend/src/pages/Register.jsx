import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    phone: '',
    email: '',
    password: '',
    profession: '',
    skills: '',
    districtId: '' // Backend ile uyumlu
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handlePhoneChange = (e) => {
    let numbers = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (numbers.length > 0 && numbers[0] !== '0') numbers = '0' + numbers;
    let formatted = numbers;
    if (numbers.length > 3) formatted = `${numbers.slice(0,4)} ${numbers.slice(4)}`;
    if (numbers.length > 6) formatted = `${numbers.slice(0,4)} ${numbers.slice(4,7)} ${numbers.slice(7)}`;
    if (numbers.length > 8) formatted = `${numbers.slice(0,4)} ${numbers.slice(4,7)} ${numbers.slice(7,9)} ${numbers.slice(9)}`;
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, surname, phone, email, password, profession, skills, districtId } = formData;

    if (!name || !surname || !phone || !email || !password || !profession || !skills || !districtId) {
      setError('Lütfen tüm alanları doldurunuz.');
      return;
    }

    const phoneRegex = /^0\d{3} \d{3} \d{2} \d{2}$/;
    if (!phoneRegex.test(phone)) {
      setError('Telefon numarası doğru formatta olmalıdır (0XXX XXX XX XX).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Geçerli bir e-posta giriniz.');
      return;
    }

    setIsLoading(true);

    // 🟢 skills string -> array
    const skillsArray = skills.split(',').map(s => s.trim());

    const result = await register({ 
      name, surname, phone, email, password, profession, skills: skillsArray, districtId, role: 'GONULLU' 
    });
    
    setIsLoading(false);

    if (result.success) {
      navigate('/login');
    } else {
      setError(result.error);
    }
  };

  // Backend ile uyumlu: her district için id
  const districts = [
    { id: 1, name: 'Kadıköy' },
    { id: 2, name: 'Beşiktaş' },
    { id: 3, name: 'Üsküdar' },
    { id: 4, name: 'Bakırköy' },
    { id: 5, name: 'Ataşehir' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
         <div className="flex justify-center">
  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-red-600">
    <img 
      src="/vite.jpg"   // public klasöründe logo.png olmalı
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
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Ad</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Soyad</label>
                <input
                  type="text"
                  name="surname"
                  value={formData.surname}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Telefon</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="0XXX XXX XX XX"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">E-posta</label>
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
              <label className="block text-sm font-medium text-gray-700">Şifre</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Meslek</label>
              <input
                type="text"
                name="profession"
                value={formData.profession}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Yetenekler</label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="Örn: Grafik, Muhasebe, Konuşma"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">İlçe</label>
              <select
                name="districtId"
                value={formData.districtId}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              >
                <option value="">Seçiniz</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              İlçe başkanları sisteme yalnızca yönetim tarafından eklenir. Üyeler ve gönüllüler bu form ile kayıt olabilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
