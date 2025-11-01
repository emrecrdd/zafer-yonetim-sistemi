import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { NOTIFICATION_TYPES } from '../config/constants.js';

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
    // ✅ Foreign key constraint'i kaldır - sonra association ile ekleyeceğiz
  },
  type: {
    type: DataTypes.ENUM(...Object.values(NOTIFICATION_TYPES)),
    defaultValue: NOTIFICATION_TYPES.SYSTEM
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
  relatedId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  relatedType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  actionUrl: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'notifications'
});

export default Notification;