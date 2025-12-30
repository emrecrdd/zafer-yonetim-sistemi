import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';
import { USER_ROLES } from '../config/constants.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true }
  },
  surname: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      is: /^[0-9+\-\s()]{10,20}$/
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  districtId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  neighborhood: {
    type: DataTypes.STRING,
    allowNull: true
  },
  skills: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  role: {
    type: DataTypes.ENUM(...Object.values(USER_ROLES)),
    defaultValue: USER_ROLES.GONULLU
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastActivity: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  profileImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // ✅ YENİ EKLENECEK PROFİL ALANLARI:
  profession: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  birthDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  birthPlace: {
    type: DataTypes.STRING,
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('male', 'female'),
    allowNull: true
  },
  bloodType: {
    type: DataTypes.ENUM('a_positive', 'a_negative', 'b_positive', 'b_negative', 'ab_positive', 'ab_negative', 'o_positive', 'o_negative'),
    allowNull: true
  },
  maritalStatus: {
    type: DataTypes.ENUM('single', 'married', 'divorced', 'widowed'),
    allowNull: true
  },
  educationLevel: {
    type: DataTypes.ENUM('primary', 'middle', 'high', 'university', 'master', 'phd'),
    allowNull: true
  },
  school: {
    type: DataTypes.STRING,
    allowNull: true
  },
  company: {
    type: DataTypes.STRING,
    allowNull: true
  },
  position: {
    type: DataTypes.STRING,
    allowNull: true
  },
  workExperience: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  emergencyContact: {
    type: DataTypes.STRING,
    allowNull: true
  },
  emergencyPhone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password && !user.password.startsWith('$2b$')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password') && !user.password.startsWith('$2b$')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    }
  }
});

// Şifre kontrol metodu
User.prototype.validatePassword = async function(password) {
  try {
    console.log('🔐 PASSWORD VALIDATION DEBUG:');
    console.log('   Input password:', password);
    console.log('   Stored hash:', this.password);

    const result = await bcrypt.compare(password, this.password);
    console.log('   Comparison result:', result);
    return result;
  } catch (error) {
    console.error('❌ PASSWORD VALIDATION ERROR:', error);
    return false;
  }
};

export default User;
