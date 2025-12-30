// backend/routes/districts.js
import express from 'express';
import { District } from '../models/index.js';

const router = express.Router();

// GET /api/districts
router.get('/', async (req, res) => {
  try {
    const districts = await District.findAll({ attributes: ['id', 'name'] });
    res.json({ success: true, districts });
  } catch (error) {
    console.error('Get districts error:', error);
    res.status(500).json({ error: 'İlçeler yüklenemedi' });
  }
});

export default router;
