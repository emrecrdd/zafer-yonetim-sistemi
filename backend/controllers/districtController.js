import { District } from '../models/index.js';

export const getDistricts = async (req, res) => {
  try {
    const districts = await District.findAll({
      attributes: ['id', 'name']
    });
    res.json({ success: true, districts });
  } catch (error) {
    console.error('Get districts error:', error);
    res.status(500).json({ error: 'İlçeler alınamadı' });
  }
};
