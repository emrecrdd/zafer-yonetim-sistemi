import sequelize from '../config/database.js';
import User from './User.js';
import District from './District.js';
import Event from './Event.js';
import Task from './Task.js';
import Notification from './Notification.js';
import Attendance from './Attendance.js';

// ÖNEMLİ: Tabloları doğru sırayla sync et
const syncDatabase = async () => {
  try {
    // 1. Önce temel tablolar
    await District.sync();
    console.log('✅ Districts tablosu sync edildi');
    
    await User.sync();
    console.log('✅ Users tablosu sync edildi');
    
    // 2. Sonra diğer tablolar
    await Event.sync();
    console.log('✅ Events tablosu sync edildi');
    
    await Task.sync();
    console.log('✅ Tasks tablosu sync edildi');
    
    await Notification.sync();
    console.log('✅ Notifications tablosu sync edildi');
    
    await Attendance.sync();
    console.log('✅ Attendance tablosu sync edildi');
    
  } catch (error) {
    console.error('❌ Database sync hatası:', error);
    throw error;
  }
};

// Associations - Sync'ten SONRA

// User ↔ District
User.belongsTo(District, { foreignKey: 'districtId', as: 'district' });
District.hasMany(User, { foreignKey: 'districtId' });

// Event ↔ District
Event.belongsTo(District, { foreignKey: 'districtId', as: 'district' });
District.hasMany(Event, { foreignKey: 'districtId' });

// Event ↔ User (organizer)
Event.belongsTo(User, { foreignKey: 'organizerId', as: 'organizer' });
User.hasMany(Event, { foreignKey: 'organizerId' });

// Task ↔ User (assignedTo / assignedBy)
Task.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignedUser' });
User.hasMany(Task, { foreignKey: 'assignedTo' });

Task.belongsTo(User, { foreignKey: 'assignedBy', as: 'assigner' });
User.hasMany(Task, { foreignKey: 'assignedBy' });

// Task ↔ District
Task.belongsTo(District, { foreignKey: 'districtId', as: 'district' });
District.hasMany(Task, { foreignKey: 'districtId' });

// Task ↔ Event
Task.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
Event.hasMany(Task, { foreignKey: 'eventId' });

// Notification ↔ User
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Notification, { foreignKey: 'userId' });

// Attendance ↔ User & Event
Attendance.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Attendance, { foreignKey: 'userId' });

Attendance.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
Event.hasMany(Attendance, { foreignKey: 'eventId' });

export {
  sequelize,
  User,
  District,
  Event,
  Task,
  Notification,
  Attendance,
  syncDatabase
};
