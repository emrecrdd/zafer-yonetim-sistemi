import React, { useState, useEffect } from 'react';
import { taskService } from '../../services/tasks';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { io } from 'socket.io-client';

const TaskForm = ({ task, onSuccess, onCancel }) => {
  const { user, isIlBaskani, isIlceBaskani } = useAuth();
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
    { value: 'low', label: 'Düşük' },
    { value: 'medium', label: 'Orta' },
    { value: 'high', label: 'Yüksek' },
    { value: 'urgent', label: 'Acil' }
  ];

  // 🔌 Socket bağlantısı (canlı backend domainini alır)
  const socket = io(import.meta.env.VITE_API_BASE || 'https://senindomain.com', {
    transports: ['websocket'],
    reconnection: true,
  });

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
  }, [task]);

  // 🔄 Dinamik verileri yükle
  useEffect(() => {
    const loadData = async () => {
      try {
        const [userRes, districtRes, eventRes] = await Promise.all([
          api.get('/users'),
          api.get('/districts'),
          api.get('/events')
        ]);

        setUsers(userRes.data.users || []);
        setDistricts(districtRes.data.districts || []);
        setEvents(eventRes.data.events || []);
      } catch (err) {
        console.error('Veri yüklenemedi:', err);
      }
    };
    loadData();
  }, []);

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
        deadline: new Date(formData.deadline).toISOString(),
      };

      let response;
      if (task) {
        response = await taskService.updateTask(task.id, submitData);
      } else {
        response = await taskService.createTask(submitData);
      }

      // 🔔 Bildirim gönder (örneğin görevi atanan kullanıcıya)
      if (response.success && formData.assignedTo) {
        socket.emit('notification:new', {
          type: 'task',
          userId: formData.assignedTo,
          message: `${user.name} ${user.surname} size bir görev atadı.`,
        });
      }

      if (response.success) {
        onSuccess(response.task || response.message);
      }
    } catch (error) {
      console.error('Görev form hatası:', error);
      alert(error.response?.data?.error || 'Görev kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  // İlçe filtreli kullanıcı listesi
  const filteredUsers = users.filter(u => !formData.districtId || u.districtId == formData.districtId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Başlık */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Görev Başlığı *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Görev başlığı girin"
            className="w-full border px-3 py-2 rounded-md focus:ring-red-500 focus:border-red-500"
          />
        </div>

        {/* Açıklama */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Görev detaylarını girin"
            className="w-full border px-3 py-2 rounded-md focus:ring-red-500 focus:border-red-500"
          />
        </div>

        {/* İlçe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">İlçe *</label>
          <select
            name="districtId"
            value={formData.districtId}
            onChange={handleChange}
            required
            disabled={!isIlBaskani && user?.districtId}
            className="w-full border px-3 py-2 rounded-md disabled:bg-gray-100"
          >
            <option value="">İlçe seçin</option>
            {districts.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Kullanıcı */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Atanan Kullanıcı *</label>
          <select
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded-md"
          >
            <option value="">Kullanıcı seçin</option>
            {filteredUsers.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} {u.surname}
              </option>
            ))}
          </select>
        </div>

        {/* Etkinlik */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">İlgili Etkinlik</label>
          <select
            name="eventId"
            value={formData.eventId}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
          >
            <option value="">Etkinlik seçin</option>
            {events.map(e => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
        </div>

        {/* Öncelik */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Öncelik *</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded-md"
          >
            {priorities.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        {/* Son Tarih */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Son Tarih *</label>
          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            required
            className="w-full border px-3 py-2 rounded-md"
          />
        </div>
      </div>

      {/* Butonlar */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50"
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Kaydediliyor...' : task ? 'Güncelle' : 'Oluştur'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
