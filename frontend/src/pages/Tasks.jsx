import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { taskService } from '../services/tasks';
import TaskForm from '../components/forms/TaskForm';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignedTo: ''
  });

  // DÜZELTİLMİŞ: Sadece user'ı al, helper'ları kendimiz oluştur
  const { user } = useAuth();

  // Helper'ları burada tanımla
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isIlBaskani = user?.role === 'IL_BASKANI';
  const isIlceBaskani = user?.role === 'ILCE_BASKANI';
  const isGonullu = user?.role === 'GONULLU';

  // DEBUG
  console.log('🎯 Tasks Debug:');
  console.log('👤 User Role:', user?.role);
  console.log('🏛️ isIlceBaskani:', isIlceBaskani);
  console.log('🙋 isGonullu:', isGonullu);

  useEffect(() => {
    loadTasks();
  }, [filters]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const params = { ...filters };
      
      const response = await taskService.getTasks(params);
      setTasks(response.data || []);
    } catch (error) {
      console.error('Load tasks error:', error);
      setError('Görevler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setShowForm(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowForm(true);
  };

  const handleFormSuccess = (result) => {
    setShowForm(false);
    setSelectedTask(null);
    loadTasks();
    
    if (result.message) {
      alert(result.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await taskService.deleteTask(taskId);
      alert('Görev başarıyla silindi');
      loadTasks();
    } catch (error) {
      alert(error.response?.data?.error || 'Silme işlemi başarısız');
    }
  };

  const handleProgressUpdate = async (taskId, progress) => {
    try {
      await taskService.updateTask(taskId, { progress });
      alert('İlerleme güncellendi');
      loadTasks();
    } catch (error) {
      alert(error.response?.data?.error || 'Güncelleme başarısız');
    }
  };

  const handleStatusUpdate = async (taskId, status) => {
    try {
      await taskService.updateTask(taskId, { status });
      alert('Durum güncellendi');
      loadTasks();
    } catch (error) {
      alert(error.response?.data?.error || 'Güncelleme başarısız');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'COMPLETED': return 'Tamamlandı';
      case 'IN_PROGRESS': return 'Devam Ediyor';
      case 'PENDING': return 'Bekliyor';
      default: return status;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'urgent': return 'Acil';
      case 'high': return 'Yüksek';
      case 'medium': return 'Orta';
      case 'low': return 'Düşük';
      default: return priority;
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
            <h1 className="text-2xl font-bold text-gray-900">Görev Yönetimi</h1>
            <p className="text-gray-600">
              {isGonullu ? 'Size atanan görevler' : 'Görevleri atayın ve takip edin'}
            </p>
          </div>
          
          {/* DÜZELTİLMİŞ: Yeni Görev Butonu */}
          {(isIlBaskani || isIlceBaskani || isSuperAdmin) && (
            <button
              onClick={handleCreateTask}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              + Yeni Görev
            </button>
          )}
        </div>
      </div>

      {/* Filtreler */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Tümü</option>
              <option value="PENDING">Bekleyen</option>
              <option value="IN_PROGRESS">Devam Eden</option>
              <option value="COMPLETED">Tamamlanan</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Öncelik</label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Tümü</option>
              <option value="urgent">Acil</option>
              <option value="high">Yüksek</option>
              <option value="medium">Orta</option>
              <option value="low">Düşük</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Atanan</label>
            <select
              value={filters.assignedTo}
              onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Tümü</option>
              <option value={user?.id}>Bana Atananlar</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={loadTasks}
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

      {/* Task Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {selectedTask ? 'Görev Düzenle' : 'Yeni Görev'}
              </h2>
              <TaskForm
                task={selectedTask}
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setShowForm(false);
                  setSelectedTask(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Görev Listesi */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Görevler ({tasks.length})
          </h2>
        </div>
        
        {tasks.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {task.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {getStatusLabel(task.status)}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {getPriorityLabel(task.priority)}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{task.description}</p>
                    
                    <div className="flex items-center text-sm text-gray-500 space-x-4 mb-3">
                      <span className="flex items-center">
                        👤 {task.assignedUser?.name} {task.assignedUser?.surname}
                      </span>
                      {task.district && (
                        <span className="flex items-center">
                          🏛️ {task.district.name}
                        </span>
                      )}
                      {task.event && (
                        <span className="flex items-center">
                          📅 {task.event.title}
                        </span>
                      )}
                      <span className="flex items-center">
                        ⏰ {new Date(task.deadline).toLocaleDateString('tr-TR')}
                      </span>
                    </div>

                    {/* İlerleme Barı */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>İlerleme</span>
                        <span>%{task.progress}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Gönüllü için ilerleme kontrolleri */}
                    {isGonullu && task.assignedTo === user?.id && task.status !== 'COMPLETED' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleProgressUpdate(task.id, Math.min(task.progress + 25, 100))}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          İlerleme Ekle (%25)
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(task.id, 'COMPLETED')}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Tamamlandı
                        </button>
                      </div>
                    )}
                  </div>

                  {/* DÜZELTİLMİŞ: Action Butonları */}
                  {(isIlBaskani || isIlceBaskani || isSuperAdmin) && (
                    <div className="ml-4 flex space-x-2">
                      <button
                        onClick={() => handleEditTask(task)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Sil
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-4xl mb-2">✅</div>
            <p className="text-gray-500">Henüz görev bulunmuyor</p>
            {/* DÜZELTİLMİŞ: İlk görev butonu */}
            {(isIlBaskani || isIlceBaskani || isSuperAdmin) && (
              <button
                onClick={handleCreateTask}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                İlk Görevi Oluştur
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;