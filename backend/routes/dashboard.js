import express from 'express';
import {
  getDashboardStats,
  getAdminDashboard
} from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Tüm dashboard route'ları için kimlik doğrulama gerekli
router.use(authenticate);

// Dashboard istatistikleri
router.get('/stats', getDashboardStats);
router.get('/admin-stats', getAdminDashboard);

export default router;