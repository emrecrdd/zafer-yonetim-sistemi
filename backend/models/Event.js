import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { EVENT_STATUS } from '../config/constants.js';

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  districtId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'districts',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('toplantı', 'stant', 'eğitim', 'sosyal', 'diğer'),
    defaultValue: 'toplantı'
  },
  status: {
    type: DataTypes.ENUM(...Object.values(EVENT_STATUS)),
    defaultValue: EVENT_STATUS.PLANNED
  },
  expectedParticipants: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  actualParticipants: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  organizerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'events'
});

export default Event;