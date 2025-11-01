import React from 'react';

const EventList = ({ events, title = "Yaklaşan Etkinlikler", emptyMessage = "Henüz etkinlik bulunmuyor" }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {events && events.length > 0 ? (
          events.map((event) => (
            <div key={event.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                    {event.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {event.description}
                  </p>
                  <div className="flex items-center text-xs text-gray-500 space-x-4">
                    <span className="flex items-center">
                      📅 {formatDate(event.date)}
                    </span>
                    <span className="flex items-center">
                      📍 {event.location}
                    </span>
                    {event.district && (
                      <span className="flex items-center">
                        🏛️ {event.district.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0">
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
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="px-6 py-8 text-center">
            <div className="text-gray-400 text-4xl mb-2">📅</div>
            <p className="text-gray-500 text-sm">{emptyMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventList;