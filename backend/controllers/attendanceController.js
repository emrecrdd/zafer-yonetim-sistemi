import { Attendance, User, Event, District } from '../models/index.js';
import { Op } from 'sequelize';

export const getEventAttendances = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status } = req.query;

    const whereConditions = { eventId };
    
    if (status) {
      whereConditions.status = status;
    }

    // Gönüllü sadece kendi katılımını görebilir
    if (req.user.role === 'GONULLU') {
      whereConditions.userId = req.user.id;
    }

    const attendances = await Attendance.findAll({
      where: whereConditions,
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'surname', 'phone', 'districtId']
        },
        {
          model: Event,
          attributes: ['id', 'title', 'date', 'districtId'],
          include: [{
            model: District,
            attributes: ['id', 'name']
          }]
        }
      ],
      order: [['respondedAt', 'DESC']]
    });

    res.json({
      success: true,
      data: attendances
    });

  } catch (error) {
    console.error('Get event attendances error:', error);
    res.status(500).json({
      error: 'Katılım bilgileri alınamadı'
    });
  }
};

export const getUserAttendances = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, upcoming } = req.query;

    const whereConditions = { userId };

    if (status) {
      whereConditions.status = status;
    }

    // Yetki kontrolü - Kullanıcı sadece kendi katılımlarını görebilir
    if (req.user.role === 'GONULLU' && userId != req.user.id) {
      return res.status(403).json({
        error: 'Başka kullanıcıların katılımlarını görüntüleme yetkiniz yok'
      });
    }

    const includeConditions = [{
      model: Event,
      attributes: ['id', 'title', 'date', 'location', 'type', 'status'],
      include: [{
        model: District,
        attributes: ['id', 'name']
      }]
    }];

    // Yaklaşan etkinlikler filtresi
    if (upcoming === 'true') {
      includeConditions[0].where = {
        date: { [Op.gte]: new Date() }
      };
    }

    const attendances = await Attendance.findAll({
      where: whereConditions,
      include: includeConditions,
      order: [[{ model: Event }, 'date', 'ASC']]
    });

    res.json({
      success: true,
      data: attendances
    });

  } catch (error) {
    console.error('Get user attendances error:', error);
    res.status(500).json({
      error: 'Kullanıcı katılımları alınamadı'
    });
  }
};

export const updateAttendance = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status } = req.body;

    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({
        error: 'Etkinlik bulunamadı'
      });
    }

    // Etkinlik geçmiş mi kontrol et
    if (new Date(event.date) < new Date()) {
      return res.status(400).json({
        error: 'Geçmiş etkinlikler için katılım durumu güncellenemez'
      });
    }

    let attendance = await Attendance.findOne({
      where: {
        eventId,
        userId: req.user.id
      }
    });

    if (!attendance) {
      attendance = await Attendance.create({
        eventId,
        userId: req.user.id,
        status,
        respondedAt: new Date()
      });
    } else {
      await attendance.update({
        status,
        respondedAt: new Date()
      });
    }

    // Socket ile bildirim gönder
    if (req.io) {
      req.io.to(`event_${eventId}`).emit('attendance_updated', {
        eventId,
        userId: req.user.id,
        status,
        timestamp: new Date()
      });

      // İlçe başkanına bildirim gönder
      req.io.to(`district_${event.districtId}`).emit('new_notification', {
        title: 'Katılım Güncellendi',
        message: `${req.user.name} ${req.user.surname} "${event.title}" etkinliği için katılım durumunu güncelledi`,
        type: 'EVENT_REMINDER',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Katılım durumu güncellendi',
      data: attendance
    });

  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({
      error: 'Katılım durumu güncellenirken hata oluştu'
    });
  }
};

export const getAttendanceStats = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({
        error: 'Etkinlik bulunamadı'
      });
    }

    // Yetki kontrolü - Sadece yetkililer istatistik görebilir
    if (req.user.role === 'GONULLU') {
      return res.status(403).json({
        error: 'İstatistikleri görüntüleme yetkiniz yok'
      });
    }

    const stats = await Attendance.findAll({
      where: { eventId },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    const totalAttendances = await Attendance.count({
      where: { eventId }
    });

    const confirmedCount = stats.find(s => s.status === 'confirmed')?.get('count') || 0;
    const tentativeCount = stats.find(s => s.status === 'tentative')?.get('count') || 0;
    const declinedCount = stats.find(s => s.status === 'declined')?.get('count') || 0;
    const noResponseCount = totalAttendances - confirmedCount - tentativeCount - declinedCount;

    res.json({
      success: true,
      data: {
        total: totalAttendances,
        confirmed: parseInt(confirmedCount),
        tentative: parseInt(tentativeCount),
        declined: parseInt(declinedCount),
        noResponse: noResponseCount,
        responseRate: totalAttendances > 0 ? 
          ((confirmedCount + tentativeCount + declinedCount) / totalAttendances * 100).toFixed(1) : 0
      }
    });

  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({
      error: 'İstatistikler alınamadı'
    });
  }
};