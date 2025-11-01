import { User, District } from '../models/index.js';
import { generateToken } from '../utils/generateToken.js';
import { sendWelcomeSMS } from '../utils/smsSender.js';
import { generatePassword, formatPhone } from '../utils/helpers.js';
import { USER_ROLES } from '../config/constants.js';

export const login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    console.log('🔐 LOGIN REQUEST:', { phone, password });

    // Format phone
    const formattedPhone = formatPhone(phone);
    console.log('   Formatted phone:', formattedPhone);

    const user = await User.findOne({
      where: { phone: formattedPhone },
      include: [{
        model: District,
        as: 'district',
        attributes: ['id', 'name']
      }]
    });

    console.log('👤 USER SEARCH RESULT:');
    console.log('   User found:', !!user);
    if (user) {
      console.log('   User details:', {
        id: user.id,
        name: user.name,
        phone: user.phone,
        isActive: user.isActive,
        passwordLength: user.password?.length
      });
    }

    if (!user || !user.isActive) {
      console.log('❌ USER NOT FOUND OR INACTIVE');
      return res.status(401).json({
        error: 'Geçersiz telefon veya şifre'
      });
    }

    console.log('🔑 CHECKING PASSWORD...');
    const isValidPassword = await user.validatePassword(password);
    console.log('   Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.log('❌ INVALID PASSWORD');
      return res.status(401).json({
        error: 'Geçersiz telefon veya şifre'
      });
    }

    console.log('✅ LOGIN SUCCESSFUL');
    
    // Update last activity
    await user.update({ lastActivity: new Date() });

    const token = generateToken(user.id, user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        surname: user.surname,
        phone: user.phone,
        role: user.role,
        district: user.district,
        profileImage: user.profileImage
      }
    });

  } catch (error) {
    console.error('❌ LOGIN ERROR:', error);
    res.status(500).json({
      error: 'Giriş işlemi sırasında hata oluştu'
    });
  }
};
export const register = async (req, res) => {
  try {
    const { name, surname, phone, districtId, neighborhood, skills } = req.body;

    // Telefon kontrolü
    const existingUser = await User.findOne({ 
      where: { phone: formatPhone(phone) } 
    });
    
    if (existingUser) {
      return res.status(400).json({
        error: 'Bu telefon numarası zaten kayıtlı'
      });
    }

    // İlçe kontrolü
    const district = await District.findByPk(districtId);
    if (!district) {
      return res.status(400).json({
        error: 'Geçersiz ilçe'
      });
    }

    const password = generatePassword();
    const user = await User.create({
      name,
      surname,
      phone: formatPhone(phone),
      districtId,
      neighborhood,
      skills: skills || [],
      password,
      role: USER_ROLES.GONULLU
    });

    // SMS gönder
    await sendWelcomeSMS(phone, name, password);

    const token = generateToken(user.id, user.role);

    res.status(201).json({
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu',
      token,
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
    console.error('Register error:', error);
    res.status(500).json({
      error: 'Kayıt işlemi sırasında hata oluştu'
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: District,
        as: 'district',
        attributes: ['id', 'name']
      }]
    });

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Profil bilgileri alınamadı'
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, surname, email, neighborhood, skills } = req.body;
    
    const user = await User.findByPk(req.user.id);
    
    await user.update({
      name: name || user.name,
      surname: surname || user.surname,
      email: email || user.email,
      neighborhood: neighborhood || user.neighborhood,
      skills: skills || user.skills
    });

    res.json({
      success: true,
      message: 'Profil başarıyla güncellendi',
      user: {
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        neighborhood: user.neighborhood,
        skills: user.skills
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Profil güncellenirken hata oluştu'
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.id);
    
    const isValid = await user.validatePassword(currentPassword);
    if (!isValid) {
      return res.status(400).json({
        error: 'Mevcut şifre hatalı'
      });
    }

    await user.update({ password: newPassword });

    res.json({
      success: true,
      message: 'Şifre başarıyla değiştirildi'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Şifre değiştirilirken hata oluştu'
    });
  }
};