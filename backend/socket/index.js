const setupSocket = (io) => {
  const userSockets = new Map();

  io.on('connection', (socket) => {
    console.log('✅ Yeni kullanıcı bağlandı:', socket.id);

    // Kullanıcı giriş yaptığında
    socket.on('user_connected', (userId) => {
      userSockets.set(userId, socket.id);
      socket.join(`user_${userId}`);
      socket.join(`district_${userId}`); // İlçe bazlı odalar
      console.log(`👤 Kullanıcı ${userId} bağlandı`);
    });

    // Yeni bildirim gönder
    socket.on('send_notification', (data) => {
      const { userId, title, message, type } = data;
      socket.to(`user_${userId}`).emit('new_notification', {
        title,
        message,
        type,
        timestamp: new Date()
      });
    });

    // Görev güncellemesi
    socket.on('task_updated', (data) => {
      const { taskId, progress, updatedBy, districtId } = data;
      io.to(`district_${districtId}`).emit('task_progress_update', {
        taskId,
        progress,
        updatedBy,
        timestamp: new Date()
      });
    });

    // Etkinlik katılımı
    socket.on('event_attendance', (data) => {
      const { eventId, userId, status } = data;
      io.emit('attendance_updated', {
        eventId,
        userId,
        status,
        timestamp: new Date()
      });
    });

    // Sistem duyurusu
    socket.on('send_announcement', (data) => {
      const { districtId, message } = data;
      if (districtId) {
        io.to(`district_${districtId}`).emit('new_announcement', {
          message,
          timestamp: new Date()
        });
      } else {
        io.emit('new_announcement', {
          message,
          timestamp: new Date()
        });
      }
    });

    // Bağlantı kesildiğinde
    socket.on('disconnect', () => {
      for (let [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          console.log(`👤 Kullanıcı ${userId} ayrıldı`);
          break;
        }
      }
      console.log('❌ Kullanıcı ayrıldı:', socket.id);
    });
  });

  return io;
};

export default setupSocket;