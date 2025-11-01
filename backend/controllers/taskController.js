import { Task, User, District, Event } from '../models/index.js';
import { paginate, buildPagination } from '../utils/helpers.js';
import { TASK_STATUS } from '../config/constants.js';
import { USER_ROLES } from '../config/constants.js'; // ✅ BU SATIRI EKLE
import { Op } from 'sequelize';

export const getTasks = async (req, res) => {
  try {
    const { page = 1, limit = 10, districtId, status, assignedTo, priority } = req.query;
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

    if (assignedTo) {
      whereConditions.assignedTo = assignedTo;
    }

    if (priority) {
      whereConditions.priority = priority;
    }

    // Gönüllü sadece kendi görevlerini görür
    if (req.user.role === USER_ROLES.GONULLU) {
      whereConditions.assignedTo = req.user.id;
    }

    // İlçe başkanı sadece kendi ilçesini görür
    if (req.user.role === USER_ROLES.ILCE_BASKANI) {
      whereConditions.districtId = req.user.districtId;
    }

    const { count, rows: tasks } = await Task.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'assignedUser',
          attributes: ['id', 'name', 'surname', 'phone']
        },
        {
          model: User,
          as: 'assigner',
          attributes: ['id', 'name', 'surname']
        },
        {
          model: District,
             as: 'district', // ✅ 'as' EKLE
          attributes: ['id', 'name']
        },
        {
          model: Event,
            as: 'event', // ✅ 'as' EKLE
          attributes: ['id', 'title']
        }
      ],
      limit: queryLimit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json(buildPagination(tasks, page, limit, count));

  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      error: 'Görevler getirilirken hata oluştu'
    });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByPk(id, {
      include: [
        {
          model: User,
          as: 'assignedUser',
          attributes: ['id', 'name', 'surname', 'phone']
        },
        {
          model: User,
          as: 'assigner',
          attributes: ['id', 'name', 'surname']
        },
        {
          model: District,
          attributes: ['id', 'name']
        },
        {
          model: Event,
          attributes: ['id', 'title']
        }
      ]
    });

    if (!task) {
      return res.status(404).json({
        error: 'Görev bulunamadı'
      });
    }

    // Yetki kontrolü
    if (req.user.role === USER_ROLES.GONULLU && task.assignedTo !== req.user.id) {
      return res.status(403).json({
        error: 'Bu görevi görüntüleme yetkiniz yok'
      });
    }

    if (req.user.role === USER_ROLES.ILCE_BASKANI && task.districtId !== req.user.districtId) {
      return res.status(403).json({
        error: 'Bu görevi görüntüleme yetkiniz yok'
      });
    }

    res.json({
      success: true,
      task
    });

  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      error: 'Görev bilgileri alınamadı'
    });
  }
};

export const createTask = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      assignedTo, 
      districtId, 
      eventId, 
      priority, 
      deadline 
    } = req.body;

    // eventId boş stringse null yap
    const processedEventId = (eventId === '' || eventId === null) ? null : parseInt(eventId);

    // Yetki kontrolü
    if (req.user.role === USER_ROLES.ILCE_BASKANI) {
      if (districtId !== req.user.districtId) {
        return res.status(403).json({
          error: 'Sadece kendi ilçenize görev ekleyebilirsiniz'
        });
      }
    }

    // Atanan kullanıcı kontrolü
    const assignedUser = await User.findByPk(assignedTo);
    if (!assignedUser || !assignedUser.isActive) {
      return res.status(400).json({
        error: 'Geçersiz kullanıcı'
      });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      assignedBy: req.user.id,
      districtId,
      eventId: processedEventId,
      priority: priority || 'medium',
      deadline,
      status: TASK_STATUS.PENDING
    });

    // Socket.io kontrolü - eğer varsa bildirim gönder
    if (req.io) {
      req.io.to(`user_${assignedTo}`).emit('new_notification', {
        title: 'Yeni Görev',
        message: `"${title}" görevi size atandı`,
        type: 'task_assigned',
        timestamp: new Date()
      });
    }

    res.status(201).json({
      success: true,
      message: 'Görev başarıyla oluşturuldu',
      task
    });

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      error: 'Görev oluşturulurken hata oluştu'
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    // ✅ DEĞİŞKENLERİ req.body'den DESTRUCTURE ET
    const { 
      title, 
      description, 
      status, 
      progress, 
      priority, 
      notes 
    } = req.body;
    
    console.log('🔄 Güncellenmek istenen görev ID:', id);
    console.log('🔍 Tüm parametreler:', req.params);
    console.log('📦 Gelen body:', req.body);

    const task = await Task.findByPk(id);
    if (!task) {
      console.log('❌ Görev bulunamadı, ID:', id);
      
      // Database'deki tüm görevleri listele
      const allTasks = await Task.findAll({ attributes: ['id', 'title'] });
      console.log('📋 Databasedeki tüm görevler:', allTasks.map(t => ({ id: t.id, title: t.title })));
      
      return res.status(404).json({
        error: 'Görev bulunamadı'
      });
    }

    // Yetki kontrolü
    if (req.user.role === USER_ROLES.GONULLU && task.assignedTo !== req.user.id) {
      return res.status(403).json({
        error: 'Bu görevi güncelleme yetkiniz yok'
      });
    }

    if (req.user.role === USER_ROLES.ILCE_BASKANI && task.districtId !== req.user.districtId) {
      return res.status(403).json({
        error: 'Bu görevi güncelleme yetkiniz yok'
      });
    }

    const previousProgress = task.progress;
    const previousStatus = task.status;

    await task.update({
      title: title || task.title,
      description: description || task.description,
      status: status || task.status,
      progress: progress !== undefined ? progress : task.progress,
      priority: priority || task.priority,
      notes: notes || task.notes,
      completedAt: status === TASK_STATUS.COMPLETED ? new Date() : task.completedAt
    });

    // Socket.io kontrolü - eğer varsa bildirim gönder
    if (req.io && (progress !== previousProgress || status !== previousStatus)) {
      req.io.to(`district_${task.districtId}`).emit('task_progress_update', {
        taskId: task.id,
        progress: task.progress,
        status: task.status,
        updatedBy: req.user.id,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Görev başarıyla güncellendi',
      task
    });

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      error: 'Görev güncellenirken hata oluştu'
    });
  }
};
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({
        error: 'Görev bulunamadı'
      });
    }

    // Yetki kontrolü
    if (req.user.role === USER_ROLES.ILCE_BASKANI && task.districtId !== req.user.districtId) {
      return res.status(403).json({
        error: 'Bu görevi silme yetkiniz yok'
      });
    }

    await task.destroy();

    res.json({
      success: true,
      message: 'Görev başarıyla silindi'
    });

  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      error: 'Görev silinirken hata oluştu'
    });
  }
};

export const getUserTasks = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    const whereConditions = { assignedTo: userId };

    if (status) {
      whereConditions.status = status;
    }

    // Yetki kontrolü - Kullanıcı sadece kendi görevlerini görebilir
    if (req.user.role === USER_ROLES.GONULLU && userId != req.user.id) {
      return res.status(403).json({
        error: 'Başka kullanıcıların görevlerini görüntüleme yetkiniz yok'
      });
    }

    const tasks = await Task.findAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'assigner',
          attributes: ['id', 'name', 'surname']
        },
        {
          model: District,
          attributes: ['id', 'name']
        }
      ],
      order: [['deadline', 'ASC']]
    });

    res.json({
      success: true,
      tasks
    });

  } catch (error) {
    console.error('Get user tasks error:', error);
    res.status(500).json({
      error: 'Kullanıcı görevleri getirilirken hata oluştu'
    });
  }
};