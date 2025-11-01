import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/users';
import UserForm from '../components/forms/UserForm';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({
    role: '',
    districtId: '',
    search: ''
  });
  const [stats, setStats] = useState(null);

  const { user: currentUser, isIlBaskani, isIlceBaskani } = useAuth();

  useEffect(() => {
    loadUsers();
    loadStats();
  }, [filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = { ...filters };
      
      const response = await userService.getUsers(params);
      setUsers(response.data || []);
    } catch (error) {
      console.error('Load users error:', error);
      setError('Kullanıcılar yüklenirken hata oluştu');
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

  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowForm(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowForm(true);
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
      case 'IL_BASKANI': return 'bg-purple-100 text-purple-800';
      case 'ILCE_BASKANI': return 'bg-blue-100 text-blue-800';
      case 'GONULLU': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPhone = (phone) => {
    return phone.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4');
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
            <p className="text-gray-600">Gönüllüleri görüntüle ve yönet</p>
          </div>
          
          {(isIlBaskani || isIlceBaskani) && (
            <button
              onClick={handleCreateUser}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              + Yeni Gönüllü
            </button>
          )}
        </div>
      </div>

      {/* İstatistikler */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Tümü</option>
              <option value="1">Çankaya</option>
              <option value="2">Yenimahalle</option>
              <option value="3">Keçiören</option>
            </select>
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
          
          <div className="flex items-end">
            <button
              onClick={loadUsers}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Filtrele
            </button>
          </div>
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
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Kullanıcılar ({users.length})
          </h2>
        </div>
        
        {users.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {users.map((user) => (
              <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 font-semibold text-sm">
                          {user.name?.charAt(0)}{user.surname?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {user.name} {user.surname}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 space-x-4 mb-3">
                      <span className="flex items-center">
                        📞 {formatPhone(user.phone)}
                      </span>
                      {user.district && (
                        <span className="flex items-center">
                          🏛️ {user.district.name}
                        </span>
                      )}
                      {user.neighborhood && (
                        <span className="flex items-center">
                          🏠 {user.neighborhood}
                        </span>
                      )}
                      <span className="flex items-center">
                        {user.isActive ? '✅ Aktif' : '❌ Pasif'}
                      </span>
                    </div>

                    {/* Beceriler */}
                    {user.skills && user.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {user.skills.map((skill, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Son Aktivite */}
                    {user.lastActivity && (
                      <p className="text-xs text-gray-400">
                        Son aktivite: {new Date(user.lastActivity).toLocaleDateString('tr-TR')}
                      </p>
                    )}
                  </div>

                  {/* Action Butonları */}
                  {(isIlBaskani || isIlceBaskani) && (
                    <div className="ml-4 flex space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Düzenle
                      </button>
                      {user.role !== 'IL_BASKANI' && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Pasifleştir
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-4xl mb-2">👥</div>
            <p className="text-gray-500">Henüz kullanıcı bulunmuyor</p>
            {(isIlBaskani || isIlceBaskani) && (
              <button
                onClick={handleCreateUser}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
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