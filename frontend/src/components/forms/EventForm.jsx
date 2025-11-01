import React, { useState, useEffect } from 'react';
import { eventService } from '../../services/events';
import { useAuth } from '../../context/AuthContext';

const EventForm = ({ event, onSuccess, onCancel }) => {
  const { user, isIlBaskani } = useAuth();
  const [loading, setLoading] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    districtId: user?.districtId || '',
    type: 'toplantı',
    expectedParticipants: 0
  });

  const eventTypes = [
    { value: 'toplantı', label: 'Toplantı' },
    { value: 'stant', label: 'Tanıtım Standı' },
    { value: 'eğitim', label: 'Eğitim' },
    { value: 'sosyal', label: 'Sosyal Etkinlik' },
    { value: 'diğer', label: 'Diğer' }
  ];

  useEffect(() => {
    if (event) {
      const eventDate = new Date(event.date);
      setFormData({
        title: event.title || '',
        description: event.description || '',
        date: eventDate.toISOString().split('T')[0],
        time: eventDate.toTimeString().slice(0, 5),
        location: event.location || '',
        districtId: event.districtId || user?.districtId || '',
        type: event.type || 'toplantı',
        expectedParticipants: event.expectedParticipants || 0
      });
    }
    
    // İlçe listesini getir (basit versiyon)
    loadDistricts();
  }, [event, user]);

  const loadDistricts = async () => {
    // Burada districts service olacak - şimdilik mock data
    setDistricts([
      { id: 1, name: 'Çankaya' },
      { id: 2, name: 'Yenimahalle' },
      { id: 3, name: 'Keçiören' }
    ]);
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Tarih ve saati birleştir
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      
      const submitData = {
        ...formData,
        date: dateTime.toISOString()
      };

      delete submitData.time;

      let response;
      if (event) {
        response = await eventService.updateEvent(event.id, submitData);
      } else {
        response = await eventService.createEvent(submitData);
      }

      if (response.success) {
        onSuccess(response.event || response.message);
      }
    } catch (error) {
      console.error('Event form error:', error);
      alert(error.response?.data?.error || 'İşlem başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Başlık */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Etkinlik Başlığı *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
            placeholder="Etkinlik başlığını girin"
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
            placeholder="Etkinlik detaylarını girin"
          />
        </div>

        {/* Tarih */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tarih *
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
          />
        </div>

        {/* Saat */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Saat *
          </label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
          />
        </div>

        {/* Lokasyon */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lokasyon *
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
            placeholder="Etkinlik adresi"
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
            disabled={!isIlBaskani && user?.districtId} // İlçe başkanı kendi ilçesini değiştiremez
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

        {/* Etkinlik Tipi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Etkinlik Tipi *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
          >
            {eventTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Beklenen Katılımcı */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Beklenen Katılımcı Sayısı
          </label>
          <input
            type="number"
            name="expectedParticipants"
            value={formData.expectedParticipants}
            onChange={handleChange}
            min="0"
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
          {loading ? 'Kaydediliyor...' : event ? 'Güncelle' : 'Oluştur'}
        </button>
      </div>
    </form>
  );
};

export default EventForm;