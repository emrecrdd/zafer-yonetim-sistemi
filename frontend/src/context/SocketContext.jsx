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
      // 🌍 Ortama göre socket adresi belirle
      const SOCKET_URL =
        import.meta.env.MODE === 'development'
          ? 'http://localhost:5000' // local backend port
          : 'https://zafer-yonetim-sistemi.onrender.com'; // canlı backend URL (Render)

      const newSocket = io(SOCKET_URL, {
        auth: {
          token: localStorage.getItem('token'),
        },
        transports: ['websocket'],
        withCredentials: true,
      });

      newSocket.on('connect', () => {
        console.log('🔌 Socket connected:', newSocket.id);

        // Kullanıcıyı backend’e bildir
        newSocket.emit('user_connected', user.id);

        // İlçe odasına katıl (districtId varsa)
        if (user.districtId) {
          newSocket.emit('join_district_room', user.districtId);
          console.log('🏘 Joined district room:', user.districtId);
        }
      });

      // 🔔 Yeni bildirim
      newSocket.on('new_notification', (notification) => {
        console.log('🔔 New notification:', notification);
        setNotifications((prev) => [
          {
            id: Date.now(),
            ...notification,
            createdAt: new Date(),
            isRead: false,
          },
          ...prev,
        ]);
        setUnreadCount((prev) => prev + 1);

        // Browser bildirimi
        if (Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/logo.png',
          });
        }
      });

      // 📊 Görev ilerlemesi
      newSocket.on('task_progress_update', (data) => {
        console.log('📊 Task progress update:', data);
      });

      // 🎯 Katılım güncellemesi
      newSocket.on('attendance_updated', (data) => {
        console.log('🎯 Attendance updated:', data);
      });

      // 📢 Yeni sistem duyurusu
      newSocket.on('new_announcement', (data) => {
        console.log('📢 New announcement:', data);
        setNotifications((prev) => [
          {
            id: Date.now(),
            title: 'Sistem Duyurusu',
            message: data.message,
            type: 'SYSTEM_ANNOUNCEMENT',
            createdAt: new Date(data.timestamp),
            isRead: false,
          },
          ...prev,
        ]);
        setUnreadCount((prev) => prev + 1);
      });

      newSocket.on('disconnect', () => {
        console.log('🔌 Socket disconnected');
      });

      newSocket.on('connect_error', (err) => {
        console.error('❌ Socket connection error:', err.message);
      });

      setSocket(newSocket);

      // Bildirimleri yükle
      loadNotifications();
      loadUnreadCount();

      return () => {
        newSocket.close();
        console.log('🧹 Socket closed');
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [isAuthenticated, user]);

  // 📨 Bildirimleri yükle
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

  // 🔖 Bildirimi okundu işaretle
  const markAsRead = async (notificationId) => {
    try {
      if (typeof notificationId === 'number') {
        await notificationService.markAsRead(notificationId);
      }
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Mark all as read error:', error);
    }
  };

  // 🗑 Bildirimi sil
  const deleteNotification = async (notificationId) => {
    try {
      if (typeof notificationId === 'number') {
        await notificationService.deleteNotification(notificationId);
      }
      const notification = notifications.find((n) => n.id === notificationId);
      if (notification && !notification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error('Delete notification error:', error);
    }
  };

  // 📤 Bildirim gönder
  const sendNotification = (userId, title, message, type = 'SYSTEM_ANNOUNCEMENT') => {
    if (socket) {
      socket.emit('send_notification', {
        userId,
        title,
        message,
        type,
      });
    }
  };

  // 📤 Görev güncellemesi gönder
  const sendTaskUpdate = (taskId, progress, districtId) => {
    if (socket) {
      socket.emit('task_updated', {
        taskId,
        progress,
        districtId,
        updatedBy: user?.id,
      });
    }
  };

  // 📢 Sistem duyurusu gönder
  const sendAnnouncement = (message, districtId = null) => {
    if (socket) {
      socket.emit('send_announcement', {
        districtId,
        message,
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
    sendAnnouncement,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
