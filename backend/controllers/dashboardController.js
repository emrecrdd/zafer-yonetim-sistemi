import { User, District, Event, Task, Attendance } from '../models/index.js';
import { USER_ROLES, TASK_STATUS, EVENT_STATUS } from '../config/constants.js';
import { Op, fn, col } from 'sequelize';

export const getDashboardStats = async (req, res) => {
  try {
    const { districtId } = req.query;
    
    const whereConditions = { isActive: true };
    const eventWhereConditions = {};
    const taskWhereConditions = {};

    // Yetki kontrolü
    if (req.user.role === USER_ROLES.ILCE_BASKANI) {
      whereConditions.districtId = req.user.districtId;
      eventWhereConditions.districtId = req.user.districtId;
      taskWhereConditions.districtId = req.user.districtId;
    } else if (districtId) {
      whereConditions.districtId = districtId;
      eventWhereConditions.districtId = districtId;
      taskWhereConditions.districtId = districtId;
    }

    if (req.user.role === USER_ROLES.GONULLU) {
      whereConditions.id = req.user.id;
      taskWhereConditions.assignedTo = req.user.id;
    }

    // Temel istatistikler
    const totalUsers = await User.count({ where: whereConditions });
    const activeEvents = await Event.count({
      where: {
        ...eventWhereConditions,
        status: EVENT_STATUS.PLANNED,
        date: { [Op.gte]: new Date() }
      }
    });
    const totalTasks = await Task.count({ where: taskWhereConditions });
    const completedTasks = await Task.count({
      where: {
        ...taskWhereConditions,
        status: TASK_STATUS.COMPLETED
      }
    });

    // Yaklaşan etkinlikler
    const upcomingEvents = await Event.findAll({
      where: {
        ...eventWhereConditions,
        status: EVENT_STATUS.PLANNED,
        date: { [Op.gte]: new Date() }
      },
      include: [{
        model: District,
        as: 'district', // alias uyumlu
        attributes: ['id', 'name']
      }],
      order: [['date', 'ASC']],
      limit: 5
    });

    // Son görevler
    const recentTasks = await Task.findAll({
      where: taskWhereConditions,
      include: [
        {
          model: User,
          as: 'assignedUser',
          attributes: ['id', 'name', 'surname']
        },
        {
          model: District,
          as: 'district',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    // İlçe bazlı kullanıcı dağılımı (sadece il başkanı ve super admin)
    let districtStats = [];
    if ([USER_ROLES.SUPER_ADMIN, USER_ROLES.IL_BASKANI].includes(req.user.role)) {
      districtStats = await User.findAll({
        where: { isActive: true },
        include: [{
          model: District,
          as: 'district',
          attributes: ['id', 'name']
        }],
        attributes: [
          'districtId',
          [fn('COUNT', col('User.id')), 'userCount']
        ],
        group: ['districtId', 'district.id', 'district.name'],
        order: [[fn('COUNT', col('User.id')), 'DESC']]
      });
    }

    // Görev durum dağılımı
    const taskStatusStats = await Task.findAll({
      where: taskWhereConditions,
      attributes: [
        'status',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['status']
    });

    // Aktivite grafiği (son 7 gün)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const userActivity = await User.findAll({
      where: {
        ...whereConditions,
        lastActivity: { [Op.gte]: lastWeek }
      },
      attributes: [
        [fn('DATE', col('lastActivity')), 'date'],
        [fn('COUNT', col('id')), 'count']
      ],
      group: [fn('DATE', col('lastActivity'))],
      order: [[fn('DATE', col('lastActivity')), 'ASC']]
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeEvents,
        totalTasks,
        completedTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      },
      upcomingEvents,
      recentTasks,
      districtStats,
      taskStatusStats,
      userActivity
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      error: 'Dashboard istatistikleri alınamadı'
    });
  }
};

export const getAdminDashboard = async (req, res) => {
  try {
    if (![USER_ROLES.SUPER_ADMIN, USER_ROLES.IL_BASKANI].includes(req.user.role)) {
      return res.status(403).json({
        error: 'Bu sayfaya erişim yetkiniz yok'
      });
    }

    // İlçeler
    const districts = await District.findAll({
      include: [{
        model: User,
        as: 'users',
        where: { isActive: true },
        required: false,
        attributes: []
      }],
      attributes: [
        'id',
        'name',
        [fn('COUNT', col('users.id')), 'userCount']
      ],
      group: ['District.id']
    });

    // Etkinlik istatistikleri
    const eventStats = await Event.findAll({
      attributes: [
        'status',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['status']
    });

    // Görev istatistikleri
    const taskStats = await Task.findAll({
      attributes: [
        'status',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['status']
    });

    // Son 30 gün kayıt
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const newRegistrations = await User.findAll({
      where: {
        isActive: true,
        createdAt: { [Op.gte]: last30Days }
      },
      attributes: [
        [fn('DATE', col('createdAt')), 'date'],
        [fn('COUNT', col('id')), 'count']
      ],
      group: [fn('DATE', col('createdAt'))],
      order: [[fn('DATE', col('createdAt')), 'ASC']]
    });

    // En aktif ilçeler
    const activeDistricts = await User.findAll({
      where: {
        isActive: true,
        lastActivity: { [Op.gte]: last30Days }
      },
      include: [{
        model: District,
        as: 'district',
        attributes: ['name']
      }],
      attributes: [
        'districtId',
        [fn('COUNT', col('User.id')), 'activeUsers']
      ],
      group: ['districtId', 'district.id'],
      order: [[fn('COUNT', col('User.id')), 'DESC']],
      limit: 5
    });

    res.json({
      success: true,
      adminStats: {
        totalDistricts: districts.length,
        totalEvents: eventStats.reduce((sum, stat) => sum + parseInt(stat.get('count')), 0),
        totalTasks: taskStats.reduce((sum, stat) => sum + parseInt(stat.get('count')), 0),
        districts,
        eventStats,
        taskStats,
        newRegistrations,
        activeDistricts
      }
    });

  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({
      error: 'Admin dashboard istatistikleri alınamadı'
    });
  }
};
