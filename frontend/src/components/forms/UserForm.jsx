import React, { useState, useEffect } from 'react';
import { userService } from '../../services/users';
import { useAuth } from '../../context/AuthContext';

const UserForm = ({ user, onSuccess, onCancel }) => {
  const { user: currentUser, isIlBaskani } = useAuth();
  const [loading, setLoading] = useState(false);
  const [districts, setDistricts] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    phone: '',
    districtId: currentUser?.districtId || '',
    neighborhood: '',
    skills: [],
    role: 'GONULLU'
  });

  const skillsOptions = [
    'Broşür Dağıtımı',
    'Stant Görevlisi', 
    'Toplantı Organizasyonu',
    'Saha Çalışması',
    'İletişim',
    'Lojistik',
    'Teknik Destek',
    'Eğitim'
  ];

  const roleOptions = [
    { value: 'GONULLU', label: 'Gönüllü' },
    { value: 'ILCE_BASKANI', label: 'İlçe Başkanı', disabled: !isIlBaskani },
    { value: 'IL_BASKANI', label: 'İl Başkanı', disabled: !isIlBaskani }
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        surname: user.surname || '',
        phone: user.phone || '',
        districtId: user.districtId || currentUser?.districtId || '',
        neighborhood: user.neighborhood || '',
        skills: user.skills || [],
        role: user.role || 'GONULLU'
      });
    }
    
    loadDistricts();
  }, [user, currentUser]);

  const loadDistricts = async () => {
    // Mock data - gerçek uygulamada API'den çekilecek
    setDistricts([
      { id: 1, name: 'Çankaya' },
      { id: 2, name: 'Yenimahalle' },
      { id: 3, name: 'Keçiören' },
      { id: 4, name: 'Mamak' },
      { id: 5, name: 'Altındağ' }
    ]);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        skills: checked 
          ? [...prev.skills, value]
          : prev.skills.filter(skill => skill !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    const formatted = value.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4');
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (user) {
        response = await userService.updateUser(user.id, formData);
      } else {
        response = await userService.createUser(formData);
      }

      if (response.success) {
        onSuccess(response.user || response.message);
      }
    } catch (error) {
      console.error('User form error:', error);
      alert(error.response?.data?.error || 'İşlem başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ad *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
            placeholder="Kullanıcı adı"
          />
        </div>

        {/* Soyad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Soyad *
          </label>
          <input
            type="text"
            name="surname"
            value={formData.surname}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
            placeholder="Kullanıcı soyadı"
          />
        </div>

        {/* Telefon */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefon *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handlePhoneChange}
            required
            maxLength={14}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
            placeholder="555 123 45 67"
          />
        </div>

        {/* İlçe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            İlçe *
          </label>
          <select
            name="districtId"
            value={formData.districtId}
            onChange={handleChange}
            required
            disabled={!isIlBaskani && currentUser?.districtId}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50"
          >
            <option value="">İlçe seçin</option>
            {districts.map(district => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </select>
        </div>

        {/* Mahalle */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mahalle
          </label>
          <input
            type="text"
            name="neighborhood"
            value={formData.neighborhood}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
            placeholder="Mahalle adı"
          />
        </div>

        {/* Rol */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rol *
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
          >
            {roleOptions.map(role => (
              <option 
                key={role.value} 
                value={role.value}
                disabled={role.disabled}
              >
                {role.label}
              </option>
            ))}
          </select>
        </div>

        {/* Beceriler */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Beceriler
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {skillsOptions.map(skill => (
              <label key={skill} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={skill}
                  checked={formData.skills.includes(skill)}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">{skill}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Bilgilendirme */}
      {!user && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-blue-400">ℹ️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Bilgilendirme
              </h3>
              <div className="mt-1 text-sm text-blue-700">
                <p>Kullanıcıya otomatik olarak SMS ile şifre gönderilecektir.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Butonlar */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
        >
          {loading ? 'Kaydediliyor...' : user ? 'Güncelle' : 'Oluştur'}
        </button>
      </div>
    </form>
  );
};

export default UserForm;