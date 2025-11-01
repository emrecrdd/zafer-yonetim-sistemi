import React, { useState, useEffect } from 'react';
import { taskService } from '../../services/tasks';
import { useAuth } from '../../context/AuthContext';

const TaskForm = ({ task, onSuccess, onCancel }) => {
  const { user, isIlBaskani } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [events, setEvents] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    districtId: user?.districtId || '',
    eventId: '',
    priority: 'medium',
    deadline: ''
  });

  const priorities = [
    { value: 'low', label: 'Düşük', color: 'bg-gray-100 text-gray-800' },
    { value: 'medium', label: 'Orta', color: 'bg-blue-100 text-blue-800' },
    { value: 'high', label: 'Yüksek', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Acil', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        assignedTo: task.assignedTo || '',
        districtId: task.districtId || user?.districtId || '',
        eventId: task.eventId || '',
        priority: task.priority || 'medium',
        deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : ''
      });
    }
    
    loadFormData();
  }, [task, user]);

  const loadFormData = async () => {
    // Mock data - gerçek uygulamada API'den çekilecek
    setUsers([
      { id: 1, name: 'Ahmet', surname: 'Yılmaz', districtId: 1 },
      { id: 2, name: 'Mehmet', surname: 'Kaya', districtId: 1 },
      { id: 3, name: 'Ayşe', surname: 'Demir', districtId: 2 }
    ]);
    
    setDistricts([
      { id: 1, name: 'Çankaya' },
      { id: 2, name: 'Yenimahalle' },
      { id: 3, name: 'Keçiören' }
    ]);
    
    setEvents([
      { id: 1, title: 'Toplantı - Çankaya' },
      { id: 2, title: 'Stant - Yenimahalle' }
    ]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        deadline: new Date(formData.deadline).toISOString()
      };

      let response;
      if (task) {
        response = await taskService.updateTask(task.id, submitData);
      } else {
        response = await taskService.createTask(submitData);
      }

      if (response.success) {
        onSuccess(response.task || response.message);
      }
    } catch (error) {
      console.error('Task form error:', error);
      alert(error.response?.data?.error || 'İşlem başarısız');
    } finally {
      setLoading(false);
    }
  };

  // İlçeye göre kullanıcıları filtrele
  const filteredUsers = users.filter(user => 
    !formData.districtId || user.districtId == formData.districtId
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Başlık */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Görev Başlığı *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
            placeholder="Görev başlığını girin"
          />
        </div>

        {/* Açıklama */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Açıklama
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
            placeholder="Görev detaylarını girin"
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
            disabled={!isIlBaskani && user?.districtId}
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

        {/* Atanan Kullanıcı */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Atanan Kullanıcı *
          </label>
          <select
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
          >
            <option value="">Kullanıcı seçin</option>
            {filteredUsers.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} {user.surname}
              </option>
            ))}
          </select>
        </div>

        {/* Etkinlik */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            İlgili Etkinlik
          </label>
          <select
            name="eventId"
            value={formData.eventId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
          >
            <option value="">Etkinlik seçin (opsiyonel)</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </div>

        {/* Öncelik */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Öncelik *
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
          >
            {priorities.map(priority => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
        </div>

        {/* Son Tarih */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Son Tarih *
          </label>
          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            required
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
          />
        </div>
      </div>

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
          {loading ? 'Kaydediliyor...' : task ? 'Güncelle' : 'Oluştur'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;