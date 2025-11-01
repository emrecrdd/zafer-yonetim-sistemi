import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { notificationService } from '../services/notifications';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io('http://localhost:3000', {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      newSocket.on('connect', () => {
        console.log('🔌 Socket connected:', newSocket.id);
        
        // Backend'deki user_connected event'ini tetikle
        newSocket.emit('user_connected', user.id);
        
        // İlçe odasına katıl
        if (user.districtId) {
          newSocket.emit('user_connected', user.districtId); // district odasına da katıl
        }
      });

      // Yeni bildirim event'i
      newSocket.on('new_notification', (notification) => {
        console.log('🔔 New notification:', notification);
        setNotifications(prev => [{
          id: Date.now(), // Geçici ID
          ...notification,
          createdAt: new Date(),
          isRead: false
        }, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Browser bildirimi göster
        if (Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/logo.png'
          });
        }
      });

      // Görev güncelleme event'i
      newSocket.on('task_progress_update', (data) => {
        console.log('📊 Task progress update:', data);
        // Bu event geldiğinde görev listesini yeniden yükleyebilirsin
        // veya state güncelleyebilirsin
      });

      // Katılım güncelleme event'i
      newSocket.on('attendance_updated', (data) => {
        console.log('🎯 Attendance updated:', data);
        // Etkinlik sayfasında katılım durumunu güncelleyebilirsin
      });

      // Sistem duyurusu event'i
      newSocket.on('new_announcement', (data) => {
        console.log('📢 New announcement:', data);
        // Sistem duyurusunu göster
        setNotifications(prev => [{
          id: Date.now(),
          title: 'Sistem Duyurusu',
          message: data.message,
          type: 'SYSTEM_ANNOUNCEMENT',
          createdAt: new Date(data.timestamp),
          isRead: false
        }, ...prev]);
        setUnreadCount(prev => prev + 1);
      });

      newSocket.on('disconnect', () => {
        console.log('🔌 Socket disconnected');
      });

      newSocket.on('error', (error) => {
        console.error('❌ Socket error:', error);
      });

      setSocket(newSocket);

      // İlk bildirimleri yükle
      loadNotifications();
      loadUnreadCount();

      return () => {
        newSocket.close();
      };
    } else {
      // Kullanıcı çıkış yaptığında socket'i kapat
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [isAuthenticated, user]);

  const loadNotifications = async () => {
    try {
      const response = await notificationService.getNotifications({ limit: 10 });
      if (response.data) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Load notifications error:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.count);
      }
    } catch (error) {
      console.error('Load unread count error:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      // Eğer gerçek bir notification ID'si ise (sayısal)
      if (typeof notificationId === 'number') {
        await notificationService.markAsRead(notificationId);
      }
      
      // Local state'i güncelle
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Mark all as read error:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      // Eğer gerçek bir notification ID'si ise
      if (typeof notificationId === 'number') {
        await notificationService.deleteNotification(notificationId);
      }
      
      // Local state'ten kaldır
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Delete notification error:', error);
    }
  };

  // Socket üzerinden bildirim gönderme fonksiyonu
  const sendNotification = (userId, title, message, type = 'SYSTEM_ANNOUNCEMENT') => {
    if (socket) {
      socket.emit('send_notification', {
        userId,
        title,
        message,
        type
      });
    }
  };

  // Görev güncellemesi gönderme
  const sendTaskUpdate = (taskId, progress, districtId) => {
    if (socket) {
      socket.emit('task_updated', {
        taskId,
        progress,
        districtId,
        updatedBy: user?.id
      });
    }
  };

  // Sistem duyurusu gönderme
  const sendAnnouncement = (message, districtId = null) => {
    if (socket) {
      socket.emit('send_announcement', {
        districtId,
        message
      });
    }
  };

  const value = {
    socket,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadNotifications,
    loadUnreadCount,
    sendNotification,
    sendTaskUpdate,
    sendAnnouncement
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};