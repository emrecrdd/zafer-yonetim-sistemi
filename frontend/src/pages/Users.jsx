import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/users';
import UserForm from '../components/forms/UserForm';
import api from '../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({
    role: '',
    districtId: '',
    search: '',
    profession: '',
    skill: ''
  });
  const [stats, setStats] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [showDetails, setShowDetails] = useState({});

  const { user: currentUser, isIlBaskani, isIlceBaskani } = useAuth();

  useEffect(() => {
    loadUsers();
    loadStats();
    loadDistricts();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Filtreleri temizle (undefined değerleri kaldır)
      const params = {};
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params[key] = filters[key];
        }
      });
      
      console.log('📤 API isteği parametreleri:', params);
      
      // İlçe başkanı için districtId kaldır
      if (isIlceBaskani) {
        delete params.districtId;
      }
      
      const response = await api.get('/users', { params });
      console.log('📥 API Response:', response.data);
      
      // Backend'in döndüğü formata göre veriyi al
      // buildPagination kullanılıyorsa: { data: [...], pagination: {...} }
      // Direkt array döndürüyorsa: [...]
      let usersData = [];
      
      if (response.data && Array.isArray(response.data)) {
        // Direkt array geliyor
        usersData = response.data;
      } else if (response.data && response.data.data) {
        // Pagination yapısı içinde geliyor
        usersData = response.data.data;
      }
      
      console.log('🔍 Alınan kullanıcı sayısı:', usersData.length);
      
      // Skills formatını düzelt ve tüm verileri işle
      const formattedUsers = usersData.map(user => {
        // Skills'i array formatına çevir
        let skillsArray = [];
        if (Array.isArray(user.skills)) {
          skillsArray = user.skills;
        } else if (typeof user.skills === 'string') {
          skillsArray = user.skills.split(',').map(s => s.trim()).filter(s => s);
        }
        
        // Blood type formatını düzelt
        let bloodTypeLabel = user.bloodType || '';
        if (user.bloodType && user.bloodType.includes('_')) {
          const bloodTypes = {
            'a_positive': 'A Rh+',
            'a_negative': 'A Rh-',
            'b_positive': 'B Rh+',
            'b_negative': 'B Rh-',
            'ab_positive': 'AB Rh+',
            'ab_negative': 'AB Rh-',
            'o_positive': '0 Rh+',
            'o_negative': '0 Rh-'
          };
          bloodTypeLabel = bloodTypes[user.bloodType] || user.bloodType;
        }
        
        // Marital status formatını düzelt
        let maritalStatusLabel = user.maritalStatus || '';
        if (user.maritalStatus) {
          const maritalStatuses = {
            'single': 'Bekar',
            'married': 'Evli',
            'divorced': 'Boşanmış',
            'widowed': 'Dul'
          };
          maritalStatusLabel = maritalStatuses[user.maritalStatus] || user.maritalStatus;
        }
        
        return {
          ...user,
          skills: skillsArray,
          bloodTypeLabel: bloodTypeLabel,
          maritalStatusLabel: maritalStatusLabel,
          
          // District bilgisini kontrol et
          district: user.district || null,
          
          // Default değerler
          educationLevel: user.educationLevel || '',
          gender: user.gender || '',
          company: user.company || '',
          position: user.position || '',
          workExperience: user.workExperience || '',
          birthDate: user.birthDate || '',
          birthPlace: user.birthPlace || '',
          address: user.address || '',
          emergencyContact: user.emergencyContact || '',
          emergencyPhone: user.emergencyPhone || '',
          bio: user.bio || ''
        };
      });
      
      console.log('✅ Formatlanmış kullanıcılar:', formattedUsers[0]);
      setUsers(formattedUsers);
      
    } catch (error) {
      console.error('❌ Load users error:', error);
      setError(error.response?.data?.error || error.message || 'Kullanıcılar yüklenirken hata oluştu');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await userService.getUserStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Load stats error:', error);
    }
  };

  const loadDistricts = async () => {
    try {
      const response = await api.get('/districts');
      const districtsData = response.data.districts || response.data.data || [];
      
      // İlçe başkanı ise sadece kendi ilçesini göster
      if (isIlceBaskani && currentUser?.districtId) {
        const userDistrict = districtsData.find(d => d.id === currentUser.districtId);
        if (userDistrict) {
          setDistricts([userDistrict]);
          // İlçe başkanının districtId'sini filtreye otomatik set et
          setFilters(prev => ({ ...prev, districtId: currentUser.districtId }));
        }
      } else {
        setDistricts(districtsData);
      }
    } catch (error) {
      console.error('Load districts error:', error);
    }
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowForm(true);
  };

  const handleEditUser = async (user) => {
    try {
      // Detaylı kullanıcı bilgilerini getir
      const response = await api.get(`/users/${user.id}`);
      if (response.data.success) {
        const userData = response.data.user;
        
        // Skills formatını düzelt
        let skillsArray = [];
        if (Array.isArray(userData.skills)) {
          skillsArray = userData.skills;
        } else if (typeof userData.skills === 'string') {
          skillsArray = userData.skills.split(',').map(s => s.trim()).filter(s => s);
        }
        
        const formattedUser = {
          ...userData,
          skills: skillsArray
        };
        
        setSelectedUser(formattedUser);
        setShowForm(true);
      }
    } catch (error) {
      console.error('Get user details error:', error);
      alert('Kullanıcı bilgileri getirilemedi');
    }
  };

  const handleFormSuccess = (result) => {
    setShowForm(false);
    setSelectedUser(null);
    loadUsers();
    loadStats();
    
    if (result.message) {
      alert(result.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Bu kullanıcıyı pasifleştirmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await userService.deleteUser(userId);
      alert('Kullanıcı başarıyla pasifleştirildi');
      loadUsers();
      loadStats();
    } catch (error) {
      alert(error.response?.data?.error || 'İşlem başarısız');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleFilterSubmit = () => {
    loadUsers();
  };

  const handleClearFilters = () => {
    const newFilters = {
      role: '',
      districtId: '',
      search: '',
      profession: '',
      skill: ''
    };
    
    // İlçe başkanı için districtId koru
    if (isIlceBaskani && currentUser?.districtId) {
      newFilters.districtId = currentUser.districtId;
    }
    
    setFilters(newFilters);
    setTimeout(() => loadUsers(), 100);
  };

  const toggleUserDetails = (userId) => {
    setShowDetails(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'IL_BASKANI': return 'İl Başkanı';
      case 'ILCE_BASKANI': return 'İlçe Başkanı';
      case 'GONULLU': return 'Gönüllü';
      default: return role;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'IL_BASKANI': return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'ILCE_BASKANI': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'GONULLU': return 'bg-green-100 text-green-800 border border-green-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getEducationLabel = (level) => {
    const labels = {
      'primary': 'İlkokul',
      'middle': 'Ortaokul',
      'high': 'Lise',
      'university': 'Üniversite',
      'master': 'Yüksek Lisans',
      'phd': 'Doktora'
    };
    return labels[level] || level;
  };

  const getGenderLabel = (gender) => {
    return gender === 'male' ? 'Erkek' : gender === 'female' ? 'Kadın' : '';
  };

  const getBloodTypeLabel = (bloodType) => {
    if (!bloodType) return '';
    const labels = {
      'a_positive': 'A Rh+',
      'a_negative': 'A Rh-',
      'b_positive': 'B Rh+',
      'b_negative': 'B Rh-',
      'ab_positive': 'AB Rh+',
      'ab_negative': 'AB Rh-',
      'o_positive': '0 Rh+',
      'o_negative': '0 Rh-'
    };
    return labels[bloodType] || bloodType;
  };

  const getMaritalStatusLabel = (status) => {
    if (!status) return '';
    const labels = {
      'single': 'Bekar',
      'married': 'Evli',
      'divorced': 'Boşanmış',
      'widowed': 'Dul'
    };
    return labels[status] || status;
  };

  const formatPhone = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4');
    }
    return phone;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('tr-TR');
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-200 rounded-lg h-20"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Başlık ve Butonlar */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gönüllü Yönetimi</h1>
            <p className="text-gray-600">
              {isIlceBaskani ? 'Kendi ilçenizdeki gönüllüleri görüntüle ve yönet' : 'Gönüllüleri görüntüle ve yönet'}
            </p>
          </div>
          
          {(isIlBaskani || isIlceBaskani) && (
            <button
              onClick={handleCreateUser}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Yeni Gönüllü
            </button>
          )}
        </div>
      </div>

      {/* İstatistikler */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl text-blue-600">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Toplam Gönüllü</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl text-green-600">🌟</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Aktif Gönüllü</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl text-purple-600">🏛️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">İlçe Başkanı</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.byRole?.find(r => r.role === 'ILCE_BASKANI')?.count || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl text-orange-600">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">İl Başkanı</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.byRole?.find(r => r.role === 'IL_BASKANI')?.count || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtreler */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Tümü</option>
              <option value="GONULLU">Gönüllü</option>
              <option value="ILCE_BASKANI">İlçe Başkanı</option>
              {isIlBaskani && <option value="IL_BASKANI">İl Başkanı</option>}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">İlçe</label>
            <select
              value={filters.districtId}
              onChange={(e) => handleFilterChange('districtId', e.target.value)}
              disabled={isIlceBaskani}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 ${
                isIlceBaskani ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            >
              <option value="">{isIlceBaskani ? 'Kendi İlçeniz' : 'Tümü'}</option>
              {districts.map(district => (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              ))}
            </select>
            {isIlceBaskani && (
              <p className="text-xs text-gray-500 mt-1">Sadece kendi ilçenizi görebilirsiniz</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meslek</label>
            <input
              type="text"
              value={filters.profession}
              onChange={(e) => handleFilterChange('profession', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
              placeholder="Meslek ara"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Yetenek</label>
            <input
              type="text"
              value={filters.skill}
              onChange={(e) => handleFilterChange('skill', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
              placeholder="Yetenek ara"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Arama</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
              placeholder="İsim, soyisim veya telefon"
            />
          </div>
        </div>
        
        <div className="flex justify-between mt-4">
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Filtreleri Temizle
          </button>
          <button
            onClick={handleFilterSubmit}
            className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Filtrele
          </button>
        </div>
      </div>

      {/* Hata Mesajı */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-red-400 mr-3">⚠️</div>
            <div>
              <h3 className="text-red-800 font-medium">Hata</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* User Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {selectedUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
              </h2>
              <UserForm
                user={selectedUser}
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setShowForm(false);
                  setSelectedUser(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Kullanıcı Listesi */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Kullanıcılar ({users.length})
          </h2>
          <div className="text-sm text-gray-500">
            {users.length} kayıt gösteriliyor
          </div>
        </div>
        
        {users.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {users.map((user) => (
              <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* ÜST BİLGİLER */}
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
                        <span className="text-red-600 font-bold text-lg">
                          {user.name?.charAt(0)}{user.surname?.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {user.name} {user.surname}
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                {getRoleLabel(user.role)}
                              </span>
                              <span className="text-xs text-gray-500">
                                📅 Kayıt: {formatDate(user.createdAt)}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleUserDetails(user.id)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <svg className={`w-5 h-5 transform ${showDetails[user.id] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* TEMEL BİLGİLER */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <span className="w-6 text-gray-500">📞</span>
                          <span className="ml-2 font-medium">{formatPhone(user.phone)}</span>
                        </div>
                        {user.email && (
                          <div className="flex items-center text-sm">
                            <span className="w-6 text-gray-500">📧</span>
                            <span className="ml-2 font-medium">{user.email}</span>
                          </div>
                        )}
                        <div className="flex items-center text-sm">
                          <span className="w-6 text-gray-500">🏛️</span>
                          <span className="ml-2 font-medium">{user.district?.name || 'İlçe bilgisi yok'}</span>
                        </div>
                        {user.neighborhood && (
                          <div className="flex items-center text-sm">
                            <span className="w-6 text-gray-500">🏠</span>
                            <span className="ml-2 font-medium">{user.neighborhood}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        {user.profession && (
                          <div className="flex items-center text-sm">
                            <span className="w-6 text-gray-500">💼</span>
                            <span className="ml-2 font-medium">{user.profession}</span>
                          </div>
                        )}
                        {user.educationLevel && (
                          <div className="flex items-center text-sm">
                            <span className="w-6 text-gray-500">🎓</span>
                            <span className="ml-2 font-medium">{getEducationLabel(user.educationLevel)}</span>
                          </div>
                        )}
                        {(user.company || user.position) && (
                          <div className="flex items-center text-sm">
                            <span className="w-6 text-gray-500">🏢</span>
                            <span className="ml-2 font-medium">
                              {user.company || ''}
                              {user.company && user.position && ' - '}
                              {user.position || ''}
                            </span>
                          </div>
                        )}
                        {user.workExperience && (
                          <div className="flex items-center text-sm">
                            <span className="w-6 text-gray-500">⏳</span>
                            <span className="ml-2 font-medium">{user.workExperience} yıl deneyim</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* YETENEKLER */}
                    {user.skills && user.skills.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Yetenekler:</h4>
                        <div className="flex flex-wrap gap-2">
                          {user.skills.map((skill, index) => (
                            <span 
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-red-50 text-red-700 border border-red-100"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* DETAYLI BİLGİLER (AÇ/KAPA) */}
                    {showDetails[user.id] && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Detaylı Bilgiler</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* KİŞİSEL BİLGİLER */}
                          <div className="space-y-2">
                            {(user.birthDate || user.birthPlace) && (
                              <div className="flex items-center text-sm">
                                <span className="w-6 text-gray-500">🎂</span>
                                <span className="ml-2">
                                  {user.birthDate ? `Doğum: ${formatDate(user.birthDate)}` : ''}
                                  {user.birthDate && user.birthPlace && ' '}
                                  {user.birthPlace ? `(${user.birthPlace})` : ''}
                                </span>
                              </div>
                            )}
                            {user.gender && (
                              <div className="flex items-center text-sm">
                                <span className="w-6 text-gray-500">👤</span>
                                <span className="ml-2">{getGenderLabel(user.gender)}</span>
                              </div>
                            )}
                            {user.bloodType && (
                              <div className="flex items-center text-sm">
                                <span className="w-6 text-gray-500">🩸</span>
                                <span className="ml-2">Kan Grubu: {getBloodTypeLabel(user.bloodType)}</span>
                              </div>
                            )}
                            {user.maritalStatus && (
                              <div className="flex items-center text-sm">
                                <span className="w-6 text-gray-500">💍</span>
                                <span className="ml-2">Medeni Durum: {getMaritalStatusLabel(user.maritalStatus)}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* İLETİŞİM & ACİL DURUM */}
                          <div className="space-y-2">
                            {user.address && (
                              <div className="flex items-start text-sm">
                                <span className="w-6 text-gray-500 mt-1">📍</span>
                                <span className="ml-2">{user.address}</span>
                              </div>
                            )}
                            {(user.emergencyContact || user.emergencyPhone) && (
                              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                <div className="flex items-center text-sm text-yellow-800 mb-1">
                                  <span className="w-6">🚨</span>
                                  <span className="ml-1 font-medium">Acil Durum</span>
                                </div>
                                <p className="text-sm text-yellow-700 ml-6">
                                  {user.emergencyContact || 'Bilgi yok'}
                                  {user.emergencyContact && user.emergencyPhone && ' - '}
                                  {user.emergencyPhone ? formatPhone(user.emergencyPhone) : ''}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {user.bio && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <h5 className="text-sm font-medium text-gray-700 mb-1">Hakkında:</h5>
                            <p className="text-sm text-gray-600">{user.bio}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* DURUM VE SON AKTİVİTE */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          user.isActive ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {user.isActive ? '✅ Aktif' : '❌ Pasif'}
                        </span>
                        {user.lastActivity && (
                          <span className="text-xs text-gray-500">
                            Son aktivite: {formatDate(user.lastActivity)}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {user.id}
                      </div>
                    </div>
                  </div>

                  {/* ACTION BUTONLARI */}
                  <div className="ml-4 flex flex-col space-y-2">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Düzenle
                    </button>
                    {user.role !== 'IL_BASKANI' && (
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Pasifleştir
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error ? 'Kullanıcılar yüklenirken hata oluştu' : 'Henüz kullanıcı bulunmuyor'}
            </h3>
            <p className="text-gray-500 mb-6">
              {error ? error : 'Sistemde kayıtlı kullanıcı bulunamadı.'}
            </p>
            {(isIlBaskani || isIlceBaskani) && (
              <button
                onClick={handleCreateUser}
                className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors inline-flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                İlk Kullanıcıyı Oluştur
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;