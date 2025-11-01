import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const District = sequelize.define('District', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  population: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  coordinatorName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  coordinatorPhone: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'districts'
});

export default District;