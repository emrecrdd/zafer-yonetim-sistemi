import express from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getUserTasks
} from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { USER_ROLES } from '../config/constants.js';

const router = express.Router();

// Tüm task route'ları için kimlik doğrulama gerekli
router.use(authenticate);

// Task listeleme ve görüntüleme
router.get('/', getTasks);
router.get('/:id', getTaskById);

// Task oluşturma (Yetki gerektirir)
router.post('/', requireRole([USER_ROLES.SUPER_ADMIN, USER_ROLES.IL_BASKANI, USER_ROLES.ILCE_BASKANI]), createTask);

// Task güncelleme ve silme (Yetki gerektirir)
router.put('/:id', updateTask);
router.delete('/:id', requireRole([USER_ROLES.SUPER_ADMIN, USER_ROLES.IL_BASKANI, USER_ROLES.ILCE_BASKANI]), deleteTask);

// Kullanıcı görevleri
router.get('/user/:userId', getUserTasks);

export default router;