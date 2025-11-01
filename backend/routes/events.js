import express from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  updateAttendance,
  sendEventReminders
} from '../controllers/eventController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { USER_ROLES } from '../config/constants.js';

const router = express.Router();

// Tüm event route'ları için kimlik doğrulama gerekli
router.use(authenticate);

// Event listeleme ve görüntüleme
router.get('/', getEvents);
router.get('/:id', getEventById);

// Event oluşturma, güncelleme, silme (Yetki gerektirir)
router.post('/', requireRole([USER_ROLES.SUPER_ADMIN, USER_ROLES.IL_BASKANI, USER_ROLES.ILCE_BASKANI]), createEvent);
router.put('/:id', requireRole([USER_ROLES.SUPER_ADMIN, USER_ROLES.IL_BASKANI, USER_ROLES.ILCE_BASKANI]), updateEvent);
router.delete('/:id', requireRole([USER_ROLES.SUPER_ADMIN, USER_ROLES.IL_BASKANI, USER_ROLES.ILCE_BASKANI]), deleteEvent);

// Katılım işlemleri
router.put('/:eventId/attendance', updateAttendance);
router.post('/:eventId/reminders', requireRole([USER_ROLES.SUPER_ADMIN, USER_ROLES.IL_BASKANI, USER_ROLES.ILCE_BASKANI]), sendEventReminders);

export default router;