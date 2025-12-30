import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import sequelize from './config/database.js';
import District from './models/District.js';
import User from './models/User.js';
import Event from './models/Event.js';
import Task from './models/Task.js';
import Notification from './models/Notification.js';
import Attendance from './models/Attendance.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import eventRoutes from './routes/events.js';
import taskRoutes from './routes/tasks.js';
import notificationRoutes from './routes/notifications.js';
import dashboardRoutes from './routes/dashboard.js';
import attendanceRoutes from './routes/attendance.js';
import setupSocket from './socket/index.js';
import districtRoutes from './routes/district.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/attendances', attendanceRoutes);
app.use('/api/districts', districtRoutes);

// Socket.IO
setupSocket(io);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Zafer Sistemi Çalışıyor!',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// ✅ DÜZELTİLMİŞ: Tabloları sync et, User tablosuna yeni alanları ekle
const syncDatabase = async () => {
  try {
    // Sadece tablo yoksa oluştur, varsa dokunma
    await District.sync();
    console.log('✅ Districts tablosu hazır');
    
    // ✅ User tablosunu ALTER modunda sync et (yeni alanları ekler)
    await User.sync({ alter: true });
    console.log('✅ Users tablosu hazır (yeni alanlar eklendi)');
    
    await Event.sync();
    console.log('✅ Events tablosu hazır');
    
    await Task.sync();
    console.log('✅ Tasks tablosu hazır');
    
    await Notification.sync();
    console.log('✅ Notifications tablosu hazır');
    
    await Attendance.sync();
    console.log('✅ Attendance tablosu hazır');
    
    console.log('🎉 Tüm tablolar hazır!');
  } catch (error) {
    console.error('❌ Tablo hazırlama hatası:', error);
    throw error;
  }
};

// Database connection and server start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL bağlantısı başarılı');
    
    // ✅ DÜZELTİLMİŞ: Tabloları sync et
    await syncDatabase();
    
    // Database başlangıç verilerini yükle
    console.log('🚀 Database başlangıç verileri yükleniyor...');
    const { default: initDB } = await import('./scripts/init-db.js');
    await initDB();
    
    server.listen(process.env.PORT, () => {
      console.log(`🎉 SERVER BAŞARILI! ${process.env.PORT} portunda çalışıyor!`);
      console.log(`📊 Health Check: http://localhost:${process.env.PORT}/api/health`);
      console.log(`🔑 Test Hesapları:`);
      console.log(`   - Admin: 5551234567 / admin123`);
      console.log(`   - İlçe Başkanı: 5551234568 / ilce123`);
    });
  } catch (error) {
    console.error('❌ Server başlatma hatası:', error);
    process.exit(1);
  }
};

startServer();