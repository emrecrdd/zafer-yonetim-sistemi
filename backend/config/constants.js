// backend/config/constants.js
export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  IL_BASKANI: 'IL_BASKANI', 
  ILCE_BASKANI: 'ILCE_BASKANI',
  GONULLU: 'GONULLU'  // BÜYÜK HARF
};

export const TASK_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS', 
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

export const EVENT_STATUS = {
  PLANNED: 'PLANNED',      // Büyük harf
  ONGOING: 'ONGOING',      // Büyük harf  
  COMPLETED: 'COMPLETED',  // Büyük harf
  CANCELLED: 'CANCELLED'   // Büyük harf
};

export const NOTIFICATION_TYPES = {
  TASK_ASSIGNED: 'task_assigned',
  EVENT_REMINDER: 'event_reminder',
  SYSTEM: 'system',
  ANNOUNCEMENT: 'announcement'
};

export const DISTRICTS = [
  'Çankaya', 'Keçiören', 'Yenimahalle', 'Mamak', 'Altındağ',
  'Etimesgut', 'Sincan', 'Pursaklar', 'Gölbaşı', 'Polatlı',
  'Beypazarı', 'Ayaş', 'Nallıhan', 'Kızılcahamam', 'Çamlıdere',
  'Kalecik', 'Şereflikoçhisar', 'Haymana', 'Bala', 'Elmadağ',
  'Kazan', 'Akyurt', 'Çubuk', 'Evren', 'Güdül'
];