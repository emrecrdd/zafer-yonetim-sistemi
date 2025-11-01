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
    validate: {
      notEmpty: true
    }
  },
  surname: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
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
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  districtId: {
    type: DataTypes.INTEGER,
    allowNull: false
    // ✅ Foreign key constraint kaldırıldı
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
  }
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    }
  }
});

User.prototype.validatePassword = async function(password) {
  try {
    console.log('🔐 PASSWORD VALIDATION DEBUG:');
    console.log('   Input password:', password);
    console.log('   Stored hash:', this.password);
    console.log('   Comparison result:', await bcrypt.compare(password, this.password));
    
    const result = await bcrypt.compare(password, this.password);
    console.log('   Final result:', result);
    return result;
  } catch (error) {
    console.error('❌ PASSWORD VALIDATION ERROR:', error);
    return false;
  }
};
export default User;