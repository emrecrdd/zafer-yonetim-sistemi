import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { eventService } from '../services/events';
import { attendanceService } from '../services/attendance';
import EventForm from '../components/forms/EventForm';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    upcoming: 'true'
  });
  const [userAttendances, setUserAttendances] = useState({});

  // DÜZELTİLMİŞ: Sadece user'ı al, helper'ları kendimiz oluştur
  const { user } = useAuth();

  // Helper'ları burada tanımla
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isIlBaskani = user?.role === 'IL_BASKANI';
  const isIlceBaskani = user?.role === 'ILCE_BASKANI';
  const isGonullu = user?.role === 'GONULLU';

  // DEBUG
  console.log('🎯 Events Debug:');
  console.log('👤 User Role:', user?.role);
  console.log('👑 isSuperAdmin:', isSuperAdmin);
  console.log('🏛️ isIlceBaskani:', isIlceBaskani);

  useEffect(() => {
    loadEvents();
  }, [filters]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const params = { ...filters };
      
      const response = await eventService.getEvents(params);
      const eventsData = response.data || [];
      setEvents(eventsData);
      
      // Gönüllü ise kendi katılım durumlarını yükle
      if (isGonullu) {
        loadUserAttendances(eventsData);
      }
    } catch (error) {
      console.error('Load events error:', error);
      setError('Etkinlikler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const loadUserAttendances = async (eventsList) => {
    try {
      const attendanceMap = {};
      
      // Her etkinlik için kullanıcının katılım durumunu getir
      for (const event of eventsList) {
        try {
          const response = await attendanceService.getEventAttendances(event.id);
          const userAttendance = response.data?.find(a => a.userId === user.id);
          if (userAttendance) {
            attendanceMap[event.id] = userAttendance.status;
          }
        } catch (error) {
          console.error(`Attendance load error for event ${event.id}:`, error);
        }
      }
      
      setUserAttendances(attendanceMap);
    } catch (error) {
      console.error('Load user attendances error:', error);
    }
  };

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setShowForm(true);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setShowForm(true);
  };

  const handleFormSuccess = (result) => {
    setShowForm(false);
    setSelectedEvent(null);
    loadEvents();
    
    if (result.message) {
      alert(result.message);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Bu etkinliği silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await eventService.deleteEvent(eventId);
      alert('Etkinlik başarıyla silindi');
      loadEvents();
    } catch (error) {
      alert(error.response?.data?.error || 'Silme işlemi başarısız');
    }
  };

  const handleAttendanceUpdate = async (eventId, status) => {
    try {
      await attendanceService.updateAttendance(eventId, status);
      
      // Local state'i güncelle
      setUserAttendances(prev => ({
        ...prev,
        [eventId]: status
      }));
      
      alert('Katılım durumunuz güncellendi: ' + getStatusLabel(status));
    } catch (error) {
      console.error('Attendance update error:', error);
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
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'tentative': return 'bg-yellow-100 text-yellow-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'confirmed': return 'Katılacağım';
      case 'tentative': return 'Belirsiz';
      case 'declined': return 'Katılmayacağım';
      case 'no_response': return 'Yanıt Bekliyor';
      default: return status;
    }
  };

  const getUserAttendanceStatus = (eventId) => {
    return userAttendances[eventId] || 'no_response';
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
            <h1 className="text-2xl font-bold text-gray-900">Etkinlik Yönetimi</h1>
            <p className="text-gray-600">
              {isGonullu ? 'Katılabileceğin etkinlikler' : 'Etkinlikleri oluşturun ve yönetin'}
            </p>
          </div>
          
          {/* DÜZELTİLMİŞ: Yeni Etkinlik Butonu */}
          {(isSuperAdmin || isIlBaskani || isIlceBaskani) && (
            <button
              onClick={handleCreateEvent}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              + Yeni Etkinlik
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
              <option value="PLANNED">Planlandı</option>
              <option value="ONGOING">Devam Ediyor</option>
              <option value="COMPLETED">Tamamlandı</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tip</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Tümü</option>
              <option value="toplantı">Toplantı</option>
              <option value="stant">Tanıtım Standı</option>
              <option value="eğitim">Eğitim</option>
              <option value="sosyal">Sosyal</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zaman</label>
            <select
              value={filters.upcoming}
              onChange={(e) => handleFilterChange('upcoming', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
            >
              <option value="true">Yaklaşan</option>
              <option value="false">Geçmiş</option>
              <option value="">Tümü</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={loadEvents}
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

      {/* Event Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {selectedEvent ? 'Etkinlik Düzenle' : 'Yeni Etkinlik'}
              </h2>
              <EventForm
                event={selectedEvent}
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setShowForm(false);
                  setSelectedEvent(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Etkinlik Listesi */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Etkinlikler ({events.length})
          </h2>
        </div>
        
        {events.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {events.map((event) => {
              const userAttendanceStatus = getUserAttendanceStatus(event.id);
              
              return (
                <div key={event.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {event.title}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          event.status === 'PLANNED' 
                            ? 'bg-green-100 text-green-800'
                            : event.status === 'ONGOING'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {event.status === 'PLANNED' ? 'Planlandı' : 
                           event.status === 'ONGOING' ? 'Devam Ediyor' : 'Tamamlandı'}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {event.type}
                        </span>
                        
                        {/* Kullanıcı katılım durumu */}
                        {isGonullu && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(userAttendanceStatus)}`}>
                            {getStatusLabel(userAttendanceStatus)}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3">{event.description}</p>
                      
                      <div className="flex items-center text-sm text-gray-500 space-x-4 mb-3">
                        <span className="flex items-center">
                          📅 {new Date(event.date).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span className="flex items-center">
                          📍 {event.location}
                        </span>
                        {event.district && (
                          <span className="flex items-center">
                            🏛️ {event.district.name}
                          </span>
                        )}
                        {event.organizer && (
                          <span className="flex items-center">
                            👤 {event.organizer.name} {event.organizer.surname}
                          </span>
                        )}
                      </div>

                      {/* Gönüllü için katılım butonları */}
                      {isGonullu && event.status === 'PLANNED' && (
                        <div className="mt-4 flex space-x-2">
                          <button
                            onClick={() => handleAttendanceUpdate(event.id, 'confirmed')}
                            disabled={userAttendanceStatus === 'confirmed'}
                            className={`px-3 py-1 rounded text-sm transition-colors ${
                              userAttendanceStatus === 'confirmed'
                                ? 'bg-green-600 text-white'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            ✅ Katılacağım
                          </button>
                          <button
                            onClick={() => handleAttendanceUpdate(event.id, 'tentative')}
                            disabled={userAttendanceStatus === 'tentative'}
                            className={`px-3 py-1 rounded text-sm transition-colors ${
                              userAttendanceStatus === 'tentative'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            }`}
                          >
                            ⏳ Belirsiz
                          </button>
                          <button
                            onClick={() => handleAttendanceUpdate(event.id, 'declined')}
                            disabled={userAttendanceStatus === 'declined'}
                            className={`px-3 py-1 rounded text-sm transition-colors ${
                              userAttendanceStatus === 'declined'
                                ? 'bg-red-600 text-white'
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                          >
                            ❌ Katılmayacağım
                          </button>
                        </div>
                      )}
                    </div>

                    {/* DÜZELTİLMİŞ: Action Butonları */}
                    {(isIlBaskani || isIlceBaskani) && (
                      <div className="ml-4 flex space-x-2">
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Sil
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-4xl mb-2">📅</div>
            <p className="text-gray-500">Henüz etkinlik bulunmuyor</p>
            {/* DÜZELTİLMİŞ: İlk etkinlik butonu */}
            {(isIlBaskani || isIlceBaskani) && (
              <button
                onClick={handleCreateEvent}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                İlk Etkinliği Oluştur
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;