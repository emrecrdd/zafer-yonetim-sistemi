import { User, District, Task, Event } from '../models/index.js';
import { generatePassword, formatPhone, paginate, buildPagination } from '../utils/helpers.js';
import { sendWelcomeSMS } from '../utils/smsSender.js';
import { USER_ROLES } from '../config/constants.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, districtId, role, search } = req.query;
    const { limit: queryLimit, offset } = paginate(page, limit);

    const whereConditions = { isActive: true };
    
    if (districtId) {
      if (req.user.role === USER_ROLES.ILCE_BASKANI) {
        whereConditions.districtId = req.user.districtId;
      } else {
        whereConditions.districtId = districtId;
      }
    }

    if (role) {
      whereConditions.role = role;
    }

    if (search) {
      whereConditions[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { surname: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (req.user.role === USER_ROLES.ILCE_BASKANI) {
      whereConditions.districtId = req.user.districtId;
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereConditions,
      attributes: { exclude: ['password'] },
      include: [{
        model: District,
        as: 'district',
        attributes: ['id', 'name']
      }],
      limit: queryLimit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json(buildPagination(users, page, limit, count));

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Kullanıcılar getirilirken hata oluştu' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: District,
          as: 'district',
          attributes: ['id', 'name']
        },
        {
          model: Task,
          as: 'assignedTasks',
          attributes: ['id', 'title', 'status', 'progress', 'deadline'],
          where: { status: { [Op.ne]: 'completed' } },
          required: false
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    if (req.user.role === USER_ROLES.ILCE_BASKANI && user.districtId !== req.user.districtId) {
      return res.status(403).json({ error: 'Bu kullanıcıyı görüntüleme yetkiniz yok' });
    }

    res.json({ success: true, user });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Kullanıcı bilgileri alınamadı' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, surname, phone, districtId, neighborhood, skills, role = USER_ROLES.GONULLU } = req.body;

    if (req.user.role === USER_ROLES.ILCE_BASKANI) {
      if (districtId !== req.user.districtId) {
        return res.status(403).json({ error: 'Sadece kendi ilçenize kullanıcı ekleyebilirsiniz' });
      }
      if (role !== USER_ROLES.GONULLU) {
        return res.status(403).json({ error: 'Sadece gönüllü ekleyebilirsiniz' });
      }
    }

    const existingUser = await User.findOne({ 
      where: { phone: formatPhone(phone) } 
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Bu telefon numarası zaten kayıtlı' });
    }

    const password = generatePassword();
    const user = await User.create({
      name,
      surname,
      phone: formatPhone(phone),
      districtId,
      neighborhood,
      skills: skills || [],
      role,
      password
    });

    await sendWelcomeSMS(phone, name, password);

    res.status(201).json({
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu',
      user: {
        id: user.id,
        name: user.name,
        surname: user.surname,
        phone: user.phone,
        role: user.role,
        districtId: user.districtId
      }
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Kullanıcı oluşturulurken hata oluştu' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, surname, email, neighborhood, skills, role, isActive } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    if (req.user.role === USER_ROLES.ILCE_BASKANI && user.districtId !== req.user.districtId) {
      return res.status(403).json({ error: 'Bu kullanıcıyı güncelleme yetkiniz yok' });
    }

    await user.update({
      name: name || user.name,
      surname: surname || user.surname,
      email: email || user.email,
      neighborhood: neighborhood || user.neighborhood,
      skills: skills || user.skills,
      role: role || user.role,
      isActive: isActive !== undefined ? isActive : user.isActive
    });

    res.json({
      success: true,
      message: 'Kullanıcı başarıyla güncellendi',
      user: {
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Kullanıcı güncellenirken hata oluştu' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    if (req.user.role === USER_ROLES.ILCE_BASKANI && user.districtId !== req.user.districtId) {
      return res.status(403).json({ error: 'Bu kullanıcıyı silme yetkiniz yok' });
    }

    await user.update({ isActive: false });

    res.json({ success: true, message: 'Kullanıcı başarıyla pasifleştirildi' });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Kullanıcı silinirken hata oluştu' });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const { districtId } = req.query;
    const whereConditions = { isActive: true };
    
    if (districtId) {
      whereConditions.districtId = districtId;
    }

    if (req.user.role === USER_ROLES.ILCE_BASKANI) {
      whereConditions.districtId = req.user.districtId;
    }

    const totalUsers = await User.count({ where: whereConditions });
    
    const usersByRole = await User.findAll({
      where: whereConditions,
      attributes: ['role', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['role']
    });

    const usersByDistrict = await User.findAll({
      where: whereConditions,
      include: [{
        model: District,
        as: 'district',
        attributes: ['name']
      }],
      attributes: ['districtId', [sequelize.fn('COUNT', sequelize.col('User.id')), 'count']],
     group: ['districtId', 'district.id', 'district.name']
    });

    res.json({
      success: true,
      stats: { totalUsers, byRole: usersByRole, byDistrict: usersByDistrict }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'İstatistikler alınamadı' });
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
        { model: User, as: 'assigner', attributes: ['id', 'name', 'surname'] },
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