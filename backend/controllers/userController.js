import { User, District, Task, Event } from '../models/index.js';
import { generatePassword, formatPhone, paginate, buildPagination } from '../utils/helpers.js';
import { sendWelcomeSMS } from '../utils/smsSender.js';
import { USER_ROLES } from '../config/constants.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, districtId, role, search, profession, skill } = req.query;
    const { limit: queryLimit, offset } = paginate(page, limit);

    const whereConditions = { isActive: true };
    
    // ✅ ÖNEMLİ DÜZELTME: İLÇE BAŞKANI HER ZAMAN KENDİ İLÇESİNİ GÖRSÜN
    if (req.user.role === USER_ROLES.ILCE_BASKANI) {
      whereConditions.districtId = req.user.districtId;
      console.log(`📌 İlçe Başkanı ${req.user.districtId} ID'li ilçeyi görüyor`);
    } else {
      // Sadece İl Başkanı diğer ilçeleri filtreleyebilir
      if (districtId) {
        whereConditions.districtId = districtId;
      }
    }

    // ROL FİLTRESİ (ilçe başkanı sadece GONULLU görebilir)
    if (role) {
      if (req.user.role === USER_ROLES.ILCE_BASKANI && role !== 'GONULLU') {
        return res.status(403).json({ error: 'Sadece gönüllüleri görüntüleyebilirsiniz' });
      }
      whereConditions.role = role;
    }

    // ARAMA FİLTRESİ
    if (search) {
      whereConditions[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { surname: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // YENİ FİLTRELER
    if (profession) {
      whereConditions.profession = { [Op.iLike]: `%${profession}%` };
    }

    if (skill) {
      // PostgreSQL array contains kontrolü
      whereConditions.skills = { [Op.contains]: [skill] };
    }

    console.log('🔍 Backend filtreler:', whereConditions);
    console.log('👤 Kullanıcı rolü:', req.user.role);
    console.log('📍 Kullanıcı ilçe ID:', req.user.districtId);

    const { count, rows: users } = await User.findAndCountAll({
      where: whereConditions,
      attributes: { 
        exclude: ['password'],
        include: [
          'id', 'name', 'surname', 'phone', 'email',
          'districtId', 'neighborhood', 'address',
          'skills', 'profession', 'educationLevel',
          'school', 'company', 'position', 'workExperience',
          'birthDate', 'gender', 'bloodType', 'maritalStatus',
          'emergencyContact', 'emergencyPhone', 'bio',
          'profileImage', 'role', 'isActive', 'lastActivity',
          'createdAt', 'updatedAt'
        ]
      },
      include: [{
        model: District,
        as: 'district',
        attributes: ['id', 'name', 'code']
      }],
      limit: queryLimit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    console.log('📊 Backend bulunan kullanıcı sayısı:', count);

    // Skills array formatına çevir
    const formattedUsers = users.map(user => ({
      ...user.toJSON(),
      skills: Array.isArray(user.skills) ? user.skills : 
             (typeof user.skills === 'string' ? user.skills.split(',').map(s => s.trim()).filter(s => s) : [])
    }));

    res.json(buildPagination(formattedUsers, page, limit, count));

  } catch (error) {
    console.error('❌ Get users error:', error);
    res.status(500).json({ error: 'Kullanıcılar getirilirken hata oluştu' });
  }
};
// ✅ GÜNCELLENDİ: Tüm alanları döndür
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

    // TÜM alanları döndür
    res.json({ 
      success: true, 
      user: {
        id: user.id,
        name: user.name,
        surname: user.surname,
        phone: user.phone,
        email: user.email,
        districtId: user.districtId,
        neighborhood: user.neighborhood,
        skills: user.skills,
        role: user.role,
        isActive: user.isActive,
        lastActivity: user.lastActivity,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
        
        // Yeni alanlar
        profession: user.profession,
        address: user.address,
        tcKimlik: user.tcKimlik,
        birthDate: user.birthDate,
        birthPlace: user.birthPlace,
        gender: user.gender,
        bloodType: user.bloodType,
        maritalStatus: user.maritalStatus,
        educationLevel: user.educationLevel,
        school: user.school,
        company: user.company,
        position: user.position,
        workExperience: user.workExperience,
        emergencyContact: user.emergencyContact,
        emergencyPhone: user.emergencyPhone,
        bio: user.bio,
        
        // İlişkiler
        district: user.district,
        assignedTasks: user.assignedTasks
      }
    });

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

// ✅ GÜNCELLENDİ: Tüm profil alanlarını güncelle
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, surname, email, neighborhood, skills, role, isActive,
      // Yeni alanlar
      profession, address, tcKimlik, birthDate, birthPlace, gender,
      bloodType, maritalStatus, educationLevel, school, company,
      position, workExperience, emergencyContact, emergencyPhone, bio
    } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    if (req.user.role === USER_ROLES.ILCE_BASKANI && user.districtId !== req.user.districtId) {
      return res.status(403).json({ error: 'Bu kullanıcıyı güncelleme yetkiniz yok' });
    }

    await user.update({
      // Mevcut alanlar
      name: name || user.name,
      surname: surname || user.surname,
      email: email || user.email,
      neighborhood: neighborhood || user.neighborhood,
      skills: skills || user.skills,
      role: role || user.role,
      isActive: isActive !== undefined ? isActive : user.isActive,
      
      // Yeni alanlar
      profession: profession || user.profession,
      address: address || user.address,
      tcKimlik: tcKimlik || user.tcKimlik,
      birthDate: birthDate || user.birthDate,
      birthPlace: birthPlace || user.birthPlace,
      gender: gender || user.gender,
      bloodType: bloodType || user.bloodType,
      maritalStatus: maritalStatus || user.maritalStatus,
      educationLevel: educationLevel || user.educationLevel,
      school: school || user.school,
      company: company || user.company,
      position: position || user.position,
      workExperience: workExperience || user.workExperience,
      emergencyContact: emergencyContact || user.emergencyContact,
      emergencyPhone: emergencyPhone || user.emergencyPhone,
      bio: bio || user.bio
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
        isActive: user.isActive,
        // Yeni alanlar
        profession: user.profession,
        address: user.address,
        tcKimlik: user.tcKimlik,
        birthDate: user.birthDate,
        birthPlace: user.birthPlace,
        gender: user.gender,
        bloodType: user.bloodType,
        maritalStatus: user.maritalStatus,
        educationLevel: user.educationLevel,
        school: user.school,
        company: user.company,
        position: user.position,
        workExperience: user.workExperience,
        emergencyContact: user.emergencyContact,
        emergencyPhone: user.emergencyPhone,
        bio: user.bio
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Kullanıcı güncellenirken hata oluştu' });
  }
};

// ✅ EKLENDİ: Kullanıcının kendi profilini güncelleme
// ✅ GÜNCELLENDİ: Tüm profil alanlarını güncelle (districtId dahil)
export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Kullanıcı kendi profilini mi güncelliyor?
    if (req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    const {
      // Temel bilgiler
      name, surname, email, neighborhood,
      // İLÇE BİLGİSİ - BU EKLENECEK
      districtId,
      // Yeni alanlar
      profession, address, tcKimlik, birthDate, birthPlace, gender,
      bloodType, maritalStatus, educationLevel, school, company,
      position, workExperience, emergencyContact, emergencyPhone, bio,
      skills
    } = req.body;

    console.log('📥 Update profile request:', req.body);
    console.log('📍 districtId from request:', districtId);

    // Skills'i array'e çevir
    const skillsArray = Array.isArray(skills) ? skills : 
                       (typeof skills === 'string' ? skills.split(',').map(s => s.trim()).filter(s => s) : []);

    // Güncelleme verisi 
    const updateData = {
      // Temel bilgiler
      name: name || user.name,
      surname: surname || user.surname,
      email: email || user.email,
      neighborhood: neighborhood || user.neighborhood,
      skills: skillsArray,
      
      // İLÇE BİLGİSİ - ÖNEMLİ: districtId ekleniyor
      districtId: districtId !== undefined ? parseInt(districtId) : user.districtId,
      
      // Yeni alanlar
      profession: profession || user.profession,
      address: address || user.address,
      tcKimlik: tcKimlik || user.tcKimlik,
      birthDate: birthDate || user.birthDate,
      birthPlace: birthPlace || user.birthPlace,
      gender: gender || user.gender,
      bloodType: bloodType || user.bloodType,
      maritalStatus: maritalStatus || user.maritalStatus,
      educationLevel: educationLevel || user.educationLevel,
      school: school || user.school,
      company: company || user.company,
      position: position || user.position,
      workExperience: workExperience || user.workExperience,
      emergencyContact: emergencyContact || user.emergencyContact,
      emergencyPhone: emergencyPhone || user.emergencyPhone,
      bio: bio || user.bio
    };

    console.log('📤 Update data to save:', updateData);

    await user.update(updateData);

    // Güncellenmiş kullanıcıyı tekrar getir (district bilgisiyle)
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: District,
        as: 'district',
        attributes: ['id', 'name', 'code']
      }]
    });

    res.json({
      success: true,
      message: 'Profil bilgileriniz başarıyla güncellendi',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        surname: updatedUser.surname,
        email: updatedUser.email,
        phone: updatedUser.phone,
        neighborhood: updatedUser.neighborhood,
        districtId: updatedUser.districtId, // BU DA ÖNEMLİ
        skills: updatedUser.skills,
        
        // Yeni alanlar
        profession: updatedUser.profession,
        address: updatedUser.address,
        tcKimlik: updatedUser.tcKimlik,
        birthDate: updatedUser.birthDate,
        birthPlace: updatedUser.birthPlace,
        gender: updatedUser.gender,
        bloodType: updatedUser.bloodType,
        maritalStatus: updatedUser.maritalStatus,
        educationLevel: updatedUser.educationLevel,
        school: updatedUser.school,
        company: updatedUser.company,
        position: updatedUser.position,
        workExperience: updatedUser.workExperience,
        emergencyContact: updatedUser.emergencyContact,
        emergencyPhone: updatedUser.emergencyPhone,
        bio: updatedUser.bio,
        
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        
        // District bilgisi
        district: updatedUser.district
      }
    });

  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({ error: 'Profil güncellenirken hata oluştu' });
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