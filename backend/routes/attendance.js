import express from 'express';
import {
  getEventAttendances,
  getUserAttendances,
  updateAttendance,
  getAttendanceStats
} from '../controllers/attendanceController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Tüm attendance route'ları için kimlik doğrulama gerekli
router.use(authenticate);

// Etkinlik katılımlarını getir
router.get('/events/:eventId/attendances', getEventAttendances);

// Kullanıcı katılımlarını getir
router.get('/users/:userId/attendances', getUserAttendances);

// Katılım durumu güncelle
router.put('/events/:eventId/attendance', updateAttendance);

// Katılım istatistiklerini getir
router.get('/events/:eventId/attendance-stats', getAttendanceStats);

export default router;