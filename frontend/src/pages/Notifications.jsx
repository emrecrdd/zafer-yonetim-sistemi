import React, { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
import { notificationService } from "../services/notifications";

const Notifications = () => {
  const { notifications: socketNotifications, markAsRead, deleteNotification } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread, read

  useEffect(() => {
    setNotifications(socketNotifications);
    setLoading(false);
  }, [socketNotifications]);

  // Filtrelenmiş bildirimler
  const filteredNotifications = notifications.filter(notif => {
    if (filter === "unread") return !notif.isRead;
    if (filter === "read") return notif.isRead;
    return true;
  });

  // Tümünü okundu yap
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      // SocketContext'teki markAllAsRead fonksiyonu state'i güncelleyecek
    } catch (error) {
      console.error('Tümünü okundu yapma hatası:', error);
    }
  };

  // Bildirim tipine göre ikon
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'TASK_ASSIGNED':
        return '📋';
      case 'TASK_UPDATED':
        return '🔄';
      case 'EVENT_INVITATION':
        return '📅';
      case 'SYSTEM':
        return '⚙️';
      case 'ANNOUNCEMENT':
        return '📢';
      case 'DISTRICT_ANNOUNCEMENT':
        return '🏘️';
      case 'PROVINCE_ANNOUNCEMENT':
        return '🏛️';
      default:
        return '🔔';
    }
  };

  // Bildirim tipine göre renk
  const getNotificationColor = (type) => {
    switch (type) {
      case 'TASK_ASSIGNED':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'TASK_UPDATED':
        return 'border-l-blue-500 bg-blue-50';
      case 'EVENT_INVITATION':
        return 'border-l-green-500 bg-green-50';
      case 'SYSTEM':
        return 'border-l-gray-500 bg-gray-50';
      case 'ANNOUNCEMENT':
        return 'border-l-purple-500 bg-purple-50';
      default:
        return 'border-l-gray-300 bg-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Başlık ve İstatistikler */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Bildirimler 🔔</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 
              ? `${unreadCount} okunmamış bildirim` 
              : 'Tüm bildirimler okundu'
            }
          </p>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tümünü Okundu Yap
          </button>
        )}
      </div>

      {/* Filtre Butonları */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === "all" 
              ? "bg-blue-600 text-white" 
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Tümü ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === "unread" 
              ? "bg-red-600 text-white" 
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Okunmamış ({unreadCount})
        </button>
        <button
          onClick={() => setFilter("read")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === "read" 
              ? "bg-green-600 text-white" 
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Okundu ({notifications.length - unreadCount})
        </button>
      </div>

      {/* Bildirim Listesi */}
      {filteredNotifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-500 text-lg">
            {filter === "all" 
              ? "Henüz bildirim yok" 
              : filter === "unread" 
                ? "Okunmamış bildirim yok" 
                : "Okunmuş bildirim yok"
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.slice().reverse().map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-lg border shadow-sm border-l-4 transition-all hover:shadow-md ${
                getNotificationColor(notif.type)
              } ${!notif.isRead ? 'ring-2 ring-blue-200' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getNotificationIcon(notif.type)}</span>
                    <h3 className={`font-semibold ${!notif.isRead ? 'text-blue-800' : 'text-gray-800'}`}>
                      {notif.title}
                    </h3>
                    {!notif.isRead && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        YENİ
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-700 mb-2">{notif.message}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>
                      {new Date(notif.createdAt).toLocaleString("tr-TR", {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    
                    {notif.type && (
                      <span className="bg-gray-200 px-2 py-1 rounded text-xs">
                        {notif.type.replace('_', ' ').toLowerCase()}
                      </span>
                    )}
                  </div>

                  {notif.actionUrl && (
                    <a
                      href={notif.actionUrl}
                      className="inline-block mt-3 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      Sayfaya Git →
                    </a>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 ml-4">
                  {!notif.isRead && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                      title="Okundu olarak işaretle"
                    >
                      Okundu
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notif.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                    title="Bildirimi sil"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Boşluk bırak */}
      <div className="h-8"></div>
    </div>
  );
};

export default Notifications;