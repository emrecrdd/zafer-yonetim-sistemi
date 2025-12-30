import { Task, User, District, Event, Notification } from '../models/index.js';
import { paginate, buildPagination } from '../utils/helpers.js';
import { TASK_STATUS } from '../config/constants.js';
import { USER_ROLES } from '../config/constants.js';
import { Op } from 'sequelize';

export const getTasks = async (req, res) => {
  try {
    const { page = 1, limit = 10, districtId, status, assignedTo, priority } = req.query;
    const { limit: queryLimit, offset } = paginate(page, limit);

    const whereConditions = {};
    
    if (districtId) {
      if (req.user.role === USER_ROLES.ILCE_BASKANI) {
        whereConditions.districtId = req.user.districtId;
      } else {
        whereConditions.districtId = districtId;
      }
    }

    if (status) whereConditions.status = status;
    if (assignedTo) whereConditions.assignedTo = assignedTo;
    if (priority) whereConditions.priority = priority;

    if (req.user.role === USER_ROLES.GONULLU) {
      whereConditions.assignedTo = req.user.id;
    }

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
          as: 'district',
          attributes: ['id', 'name']
        },
        {
          model: Event,
          as: 'event',
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
    res.status(500).json({ error: 'Görevler getirilirken hata oluştu' });
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
      return res.status(404).json({ error: 'Görev bulunamadı' });
    }

    if (req.user.role === USER_ROLES.GONULLU && task.assignedTo !== req.user.id) {
      return res.status(403).json({ error: 'Bu görevi görüntüleme yetkiniz yok' });
    }

    if (req.user.role === USER_ROLES.ILCE_BASKANI && task.districtId !== req.user.districtId) {
      return res.status(403).json({ error: 'Bu görevi görüntüleme yetkiniz yok' });
    }

    res.json({ success: true, task });

  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Görev bilgileri alınamadı' });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, districtId, eventId, priority, deadline } = req.body;

    const processedEventId = (eventId === '' || eventId === null) ? null : parseInt(eventId);

    if (req.user.role === USER_ROLES.ILCE_BASKANI && districtId !== req.user.districtId) {
      return res.status(403).json({ error: 'Sadece kendi ilçenize görev ekleyebilirsiniz' });
    }

    const assignedUser = await User.findByPk(assignedTo);
    if (!assignedUser || !assignedUser.isActive) {
      return res.status(400).json({ error: 'Geçersiz kullanıcı' });
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

    // 🆕 BİLDİRİM - Görev atanan kullanıcıya
    await Notification.create({
      userId: assignedTo,
      title: "Yeni Görev Atandı",
      message: `"${title}" görevi size atandı - Son tarih: ${new Date(deadline).toLocaleDateString('tr-TR')}`,
      type: "TASK_ASSIGNED",
      actionUrl: `/tasks/${task.id}`,
      relatedId: task.id,
      relatedType: 'Task',
      isRead: false
    });

    // 🆕 BİLDİRİM - İlçe başkanlarına
    const districtAdmins = await User.findAll({
      where: { districtId, role: [USER_ROLES.ILCE_BASKANI, USER_ROLES.IL_BASKANI] }
    });

    for (const admin of districtAdmins) {
      await Notification.create({
        userId: admin.id,
        title: "Yeni Görev Oluşturuldu",
        message: `"${title}" görevi ${req.user.name} tarafından oluşturuldu`,
        type: "TASK_CREATED",
        actionUrl: `/tasks/${task.id}`,
        relatedId: task.id,
        relatedType: 'Task',
        isRead: false
      });
    }

    console.log(`📢 Görev bildirimi gönderildi - Atanan: ${assignedTo}`);

    res.status(201).json({
      success: true,
      message: 'Görev başarıyla oluşturuldu',
      task
    });

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Görev oluşturulurken hata oluştu' });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, progress, priority, notes } = req.body;
    
    console.log('🔄 Güncellenmek istenen görev ID:', id);

    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ error: 'Görev bulunamadı' });
    }

    if (req.user.role === USER_ROLES.GONULLU && task.assignedTo !== req.user.id) {
      return res.status(403).json({ error: 'Bu görevi güncelleme yetkiniz yok' });
    }

    if (req.user.role === USER_ROLES.ILCE_BASKANI && task.districtId !== req.user.districtId) {
      return res.status(403).json({ error: 'Bu görevi güncelleme yetkiniz yok' });
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

    // 🆕 GÖREV GÜNCELLENDİ BİLDİRİMİ
    if (progress !== previousProgress || status !== previousStatus) {
      await Notification.create({
        userId: task.assignedTo,
        title: "Görev Güncellendi",
        message: `"${task.title}" görevinin durumu güncellendi: ${status} - %${progress}`,
        type: "TASK_UPDATED",
        actionUrl: `/tasks/${task.id}`,
        relatedId: task.id,
        relatedType: 'Task',
        isRead: false
      });

      const districtAdmins = await User.findAll({
        where: { districtId: task.districtId, role: [USER_ROLES.ILCE_BASKANI, USER_ROLES.IL_BASKANI] }
      });

      for (const admin of districtAdmins) {
        await Notification.create({
          userId: admin.id,
          title: "Görev Durumu Değişti",
          message: `"${task.title}" görevinin durumu ${req.user.name} tarafından güncellendi: ${status}`,
          type: "TASK_UPDATED",
          actionUrl: `/tasks/${task.id}`,
          relatedId: task.id,
          relatedType: 'Task',
          isRead: false
        });
      }

      console.log(`📢 Görev güncelleme bildirimi gönderildi`);
    }

    res.json({
      success: true,
      message: 'Görev başarıyla güncellendi',
      task
    });

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Görev güncellenirken hata oluştu' });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ error: 'Görev bulunamadı' });
    }

    if (req.user.role === USER_ROLES.ILCE_BASKANI && task.districtId !== req.user.districtId) {
      return res.status(403).json({ error: 'Bu görevi silme yetkiniz yok' });
    }

    await task.destroy();

    res.json({ success: true, message: 'Görev başarıyla silindi' });

  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Görev silinirken hata oluştu' });
  }
};

export const getUserTasks = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    const whereConditions = { assignedTo: userId };
    if (status) whereConditions.status = status;

    if (req.user.role === USER_ROLES.GONULLU && userId != req.user.id) {
      return res.status(403).json({ error: 'Başka kullanıcıların görevlerini görüntüleme yetkiniz yok' });
    }

    const tasks = await Task.findAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'assigner',
          attributes: ['id', 'name', 'surname']
        },
        { model: District, attributes: ['id', 'name'] }
      ],
      order: [['deadline', 'ASC']]
    });

    res.json({ success: true, tasks });

  } catch (error) {
    console.error('Get user tasks error:', error);
    res.status(500).json({ error: 'Kullanıcı görevleri getirilirken hata oluştu' });
  }
};