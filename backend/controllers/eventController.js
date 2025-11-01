import { Event, District, User, Attendance } from '../models/index.js';
import { paginate, buildPagination } from '../utils/helpers.js';
import { sendEventReminder } from '../utils/smsSender.js';
import { EVENT_STATUS } from '../config/constants.js';
import { Op } from 'sequelize';
import { USER_ROLES } from '../config/constants.js';

export const getEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10, districtId, status, type, upcoming } = req.query;
    const { limit: queryLimit, offset } = paginate(page, limit);

    const whereConditions = {};
    
    // Filtreleme
    if (districtId) {
      if (req.user.role === USER_ROLES.ILCE_BASKANI) {
        whereConditions.districtId = req.user.districtId;
      } else {
        whereConditions.districtId = districtId;
      }
    }

    if (status) {
      whereConditions.status = status;
    }

    if (type) {
      whereConditions.type = type;
    }

    if (upcoming === 'true') {
      whereConditions.date = { [Op.gte]: new Date() };
    }

    // Yetki kontrolü - İlçe başkanı sadece kendi ilçesini görebilir
    if (req.user.role === USER_ROLES.ILCE_BASKANI) {
      whereConditions.districtId = req.user.districtId;
    }

    const { count, rows: events } = await Event.findAndCountAll({
      where: whereConditions,
      include: [
        {
  model: District,
  as: 'district', // ✅ 'as' EKLE
  attributes: ['id', 'name']                
},
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'name', 'surname']
        }
      ],
      limit: queryLimit,
      offset,
      order: [['date', 'ASC']]
    });

    res.json(buildPagination(events, page, limit, count));

  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      error: 'Etkinlikler getirilirken hata oluştu'
    });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id, {
      include: [
        {
          model: District,
           as: 'district', // ✅ 'as' ALIAS EKLE
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'name', 'surname']
        },
        {
          model: Attendance,
          include: [{
            model: User,
            attributes: ['id', 'name', 'surname', 'phone']
          }]
        }
      ]
    });

    if (!event) {
      return res.status(404).json({
        error: 'Etkinlik bulunamadı'
      });
    }

    // Yetki kontrolü
    if (req.user.role === USER_ROLES.ILCE_BASKANI && event.districtId !== req.user.districtId) {
      return res.status(403).json({
        error: 'Bu etkinliği görüntüleme yetkiniz yok'
      });
    }

    res.json({
      success: true,
      event
    });

  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      error: 'Etkinlik bilgileri alınamadı'
    });
  }
};

export const createEvent = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      date, 
      location, 
      districtId, 
      type, 
      expectedParticipants 
    } = req.body;

    // Yetki kontrolü
    if (req.user.role === USER_ROLES.ILCE_BASKANI) {
      if (districtId !== req.user.districtId) {
        return res.status(403).json({
          error: 'Sadece kendi ilçenize etkinlik ekleyebilirsiniz'
        });
      }
    }

    const event = await Event.create({
      title,
      description,
      date,
      location,
      districtId,
      type: type || 'toplantı',
      expectedParticipants: expectedParticipants || 0,
      organizerId: req.user.id,
      status: EVENT_STATUS.PLANNED
    });

    // İlçedeki tüm gönüllülere katılım kaydı oluştur
    const districtUsers = await User.findAll({
      where: { 
        districtId,
        isActive: true,
        role: USER_ROLES.GONULLU
      }
    });

    const attendanceRecords = districtUsers.map(user => ({
      userId: user.id,
      eventId: event.id,
      status: 'no_response'
    }));

    await Attendance.bulkCreate(attendanceRecords);

    res.status(201).json({
      success: true,
      message: 'Etkinlik başarıyla oluşturuldu',
      event
    });

  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      error: 'Etkinlik oluşturulurken hata oluştu'
    });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, location, type, status, notes } = req.body;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({
        error: 'Etkinlik bulunamadı'
      });
    }

    // Yetki kontrolü
    if (req.user.role === USER_ROLES.ILCE_BASKANI && event.districtId !== req.user.districtId) {
      return res.status(403).json({
        error: 'Bu etkinliği güncelleme yetkiniz yok'
      });
    }

    await event.update({
      title: title || event.title,
      description: description || event.description,
      date: date || event.date,
      location: location || event.location,
      type: type || event.type,
      status: status || event.status,
      notes: notes || event.notes
    });

    res.json({
      success: true,
      message: 'Etkinlik başarıyla güncellendi',
      event
    });

  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      error: 'Etkinlik güncellenirken hata oluştu'
    });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({
        error: 'Etkinlik bulunamadı'
      });
    }

    // Yetki kontrolü
    if (req.user.role === USER_ROLES.ILCE_BASKANI && event.districtId !== req.user.districtId) {
      return res.status(403).json({
        error: 'Bu etkinliği silme yetkiniz yok'
      });
    }

    await event.destroy();

    res.json({
      success: true,
      message: 'Etkinlik başarıyla silindi'
    });

  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      error: 'Etkinlik silinirken hata oluştu'
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
    req.io.to(`event_${eventId}`).emit('attendance_updated', {
      eventId,
      userId: req.user.id,
      status,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Katılım durumu güncellendi',
      attendance
    });

  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({
      error: 'Katılım durumu güncellenirken hata oluştu'
    });
  }
};

export const sendEventReminders = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findByPk(eventId, {
      include: [{
        model: Attendance,
        include: [{
          model: User,
          attributes: ['id', 'name', 'phone']
        }]
      }]
    });

    if (!event) {
      return res.status(404).json({
        error: 'Etkinlik bulunamadı'
      });
    }

    // Katılımcılara SMS gönder
    const reminders = event.Attendances.map(async (attendance) => {
      if (attendance.User.phone) {
        await sendEventReminder(
          attendance.User.phone, 
          event.title, 
          event.date
        );
      }
    });

    await Promise.all(reminders);

    res.json({
      success: true,
      message: 'Hatırlatma mesajları gönderildi'
    });

  } catch (error) {
    console.error('Send reminders error:', error);
    res.status(500).json({
      error: 'Hatırlatma mesajları gönderilirken hata oluştu'
    });
  }
};