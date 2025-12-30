import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM(
      'SYSTEM',
      'TASK_ASSIGNED', 
      'TASK_UPDATED',
      'TASK_CREATED',      // ✅ YENİ EKLE
      'TASK_COMPLETED',    // ✅ YENİ EKLE
      'EVENT_INVITATION',
      'EVENT_CREATED',     // ✅ YENİ EKLE
      'EVENT_UPDATED',     // ✅ YENİ EKLE
      'EVENT_CANCELLED',   // ✅ YENİ EKLE
      'ANNOUNCEMENT',
      'PROVINCE_ANNOUNCEMENT',
      'DISTRICT_ANNOUNCEMENT',
      'MESSAGE',           // ✅ YENİ EKLE
      'REMINDER'           // ✅ YENİ EKLE
    ),
    defaultValue: 'SYSTEM'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  actionUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  relatedId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  relatedType: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'notifications',
  timestamps: true
});

export default Notification;