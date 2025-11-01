import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboard';
import StatsCard from '../components/dashboard/StatsCard';
import EventList from '../components/dashboard/EventList';
import QuickActions from '../components/dashboard/QuickActions';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user, isIlBaskani } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardService.getStats();
      
      if (response.success) {
        setStats(response.stats);
        setUpcomingEvents(response.upcomingEvents || []);
        setRecentTasks(response.recentTasks || []);
      }
    } catch (error) {
      console.error('Dashboard load error:', error);
      setError('Dashboard verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-400 mr-3">⚠️</div>
            <div>
              <h3 className="text-red-800 font-medium">Hata</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
          <button
            onClick={loadDashboardData}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Başlık */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Hoş Geldiniz, {user?.name} {user?.surname}!
        </h1>
        
        <p className="text-gray-600">
          {isIlBaskani ? 'İl geneli istatistikler ve yönetim' : 'Sistem genel bakış ve istatistikler'}
        </p>
      </div>

      {/* İstatistik Kartları */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Toplam Gönüllü"
            value={stats.totalUsers || 0}
            icon="👥"
            color="blue"
          />
          <StatsCard
            title="Aktif Etkinlikler"
            value={stats.activeEvents || 0}
            icon="📅"
            color="green"
          />
          <StatsCard
            title="Toplam Görev"
            value={stats.totalTasks || 0}
            icon="✅"
            color="purple"
          />
          <StatsCard
            title="Tamamlanma Oranı"
            value={`%${stats.completionRate || 0}`}
            subtitle={`${stats.completedTasks || 0} tamamlandı`}
            icon="📊"
            color="red"
          />
        </div>
      )}

      {/* Hızlı İşlemler */}
      <QuickActions />

      {/* İçerik Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yaklaşan Etkinlikler */}
        <EventList
          events={upcomingEvents}
          title="Yaklaşan Etkinlikler"
          emptyMessage="Henüz yaklaşan etkinlik bulunmuyor"
        />

        {/* Son Görevler */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Son Görevler</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {recentTasks && recentTasks.length > 0 ? (
              recentTasks.map((task) => (
                <div key={task.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">
                        {task.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {task.description}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <span className="flex items-center">
                          👤 {task.assignedUser?.name} {task.assignedUser?.surname}
                        </span>
                        {task.district && (
                          <span className="flex items-center">
                            🏛️ {task.district.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.status === 'COMPLETED' 
                          ? 'bg-green-100 text-green-800'
                          : task.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status === 'COMPLETED' ? 'Tamamlandı' : 
                         task.status === 'IN_PROGRESS' ? 'Devam Ediyor' : 'Bekliyor'}
                      </span>
                    </div>
                  </div>
                  {task.progress !== undefined && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        %{task.progress} tamamlandı
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center">
                <div className="text-gray-400 text-4xl mb-2">✅</div>
                <p className="text-gray-500 text-sm">Henüz görev bulunmuyor</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;