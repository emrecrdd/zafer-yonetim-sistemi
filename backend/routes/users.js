import express from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  getUserTasks
} from '../controllers/userController.js';
import { authenticate, canManageUsers } from '../middleware/auth.js'; // ✅ Düzeltildi
import { requireRole } from '../middleware/roles.js';
import { USER_ROLES } from '../config/constants.js';

const router = express.Router();

// Tüm kullanıcı route'ları için kimlik doğrulama gerekli
router.use(authenticate);

// Kullanıcı yönetimi için yetki gerekli
router.get('/', requireRole([USER_ROLES.SUPER_ADMIN, USER_ROLES.IL_BASKANI, USER_ROLES.ILCE_BASKANI]), getUsers);
router.get('/stats', requireRole([USER_ROLES.SUPER_ADMIN, USER_ROLES.IL_BASKANI, USER_ROLES.ILCE_BASKANI]), getUserStats);
router.post('/', requireRole([USER_ROLES.SUPER_ADMIN, USER_ROLES.IL_BASKANI, USER_ROLES.ILCE_BASKANI]), createUser);

// Belirli kullanıcı işlemleri
router.get('/:id', getUserById);
router.put('/:id', requireRole([USER_ROLES.SUPER_ADMIN, USER_ROLES.IL_BASKANI, USER_ROLES.ILCE_BASKANI]), updateUser);
router.delete('/:id', requireRole([USER_ROLES.SUPER_ADMIN, USER_ROLES.IL_BASKANI, USER_ROLES.ILCE_BASKANI]), deleteUser);

// Kullanıcı görevleri
router.get('/:userId/tasks', getUserTasks);

export default router;