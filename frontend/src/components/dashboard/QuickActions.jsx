import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
  const { user, isIlceBaskani, isIlBaskani } = useAuth();
  const navigate = useNavigate();

  const actions = [
    {
      name: 'Yeni Gönüllü Ekle',
      description: 'Sisteme yeni gönüllü kaydedin',
      icon: '👥',
      path: '/users?action=create',
      roles: ['IL_BASKANI', 'ILCE_BASKANI'],
      color: 'bg-blue-50 text-blue-700 hover:bg-blue-100'
    },
    {
      name: 'Etkinlik Oluştur',
      description: 'Yeni bir etkinlik planlayın',
      icon: '📅',
      path: '/events?action=create',
      roles: ['IL_BASKANI', 'ILCE_BASKANI'],
      color: 'bg-green-50 text-green-700 hover:bg-green-100'
    },
    {
      name: 'Görev Ata',
      description: 'Gönüllülere görev atayın',
      icon: '✅',
      path: '/tasks?action=create',
      roles: ['IL_BASKANI', 'ILCE_BaskANI'],
      color: 'bg-purple-50 text-purple-700 hover:bg-purple-100'
    },
    {
      name: 'Rapor Al',
      description: 'Detaylı istatistik raporları',
      icon: '📊',
      path: '/reports',
      roles: ['IL_BASKANI', 'ILCE_BASKANI'],
      color: 'bg-orange-50 text-orange-700 hover:bg-orange-100'
    },
    {
      name: 'Görevlerim',
      description: 'Atanan görevleri görüntüle',
      icon: '📋',
      path: '/tasks',
      roles: ['GONULLU'],
      color: 'bg-red-50 text-red-700 hover:bg-red-100'
    },
    {
      name: 'Etkinlikler',
      description: 'Katılabileceğim etkinlikler',
      icon: '🎯',
      path: '/events',
      roles: ['GONULLU'],
      color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
    }
  ];

  const filteredActions = actions.filter(action => 
    action.roles.includes(user?.role)
  );

  const handleActionClick = (path) => {
    navigate(path);
  };

  if (filteredActions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Hızlı İşlemler</h3>
        <p className="text-sm text-gray-600 mt-1">Sık kullanılan işlemlere hızlı erişim</p>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActions.map((action) => (
            <button
              key={action.name}
              onClick={() => handleActionClick(action.path)}
              className={`p-4 rounded-lg border border-transparent text-left transition-all duration-200 hover:scale-105 ${action.color}`}
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">{action.icon}</span>
                <div>
                  <div className="font-medium text-sm">{action.name}</div>
                  <div className="text-xs opacity-75 mt-1">{action.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;