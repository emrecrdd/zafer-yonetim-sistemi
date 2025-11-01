// Kullanıcı rolleri
export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  IL_BASKANI: 'IL_BASKANI',
  ILCE_BASKANI: 'ILCE_BASKANI', 
  GONULLU: 'GONULLU'
};

// Kullanıcı rol etiketleri
export const USER_ROLE_LABELS = {
  [USER_ROLES.SUPER_ADMIN]: 'Süper Admin',
  [USER_ROLES.IL_BASKANI]: 'İl Başkanı',
  [USER_ROLES.ILCE_BASKANI]: 'İlçe Başkanı',
  [USER_ROLES.GONULLU]: 'Gönüllü'
};

// Etkinlik durumları
export const EVENT_STATUS = {
  PLANNED: 'PLANNED',
  ONGOING: 'ONGOING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

// Görev durumları
export const TASK_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

// Katılım durumları
export const ATTENDANCE_STATUS = {
  CONFIRMED: 'confirmed',
  TENTATIVE: 'tentative', 
  DECLINED: 'declined',
  NO_RESPONSE: 'no_response'
};

// Katılım durum etiketleri
export const ATTENDANCE_LABELS = {
  [ATTENDANCE_STATUS.CONFIRMED]: 'Katılacağım',
  [ATTENDANCE_STATUS.TENTATIVE]: 'Belirsiz',
  [ATTENDANCE_STATUS.DECLINED]: 'Katılmayacağım',
  [ATTENDANCE_STATUS.NO_RESPONSE]: 'Yanıt Bekliyor'
};

// Bildirim türleri
export const NOTIFICATION_TYPES = {
  TASK_ASSIGNED: 'TASK_ASSIGNED',
  EVENT_REMINDER: 'EVENT_REMINDER',
  SYSTEM_ANNOUNCEMENT: 'SYSTEM_ANNOUNCEMENT',
  TASK_COMPLETED: 'TASK_COMPLETED'
};

// Telefon formatı
export const PHONE_REGEX = /^[0-9+\-\s()]{10,20}$/;

// Varsayılan API URL
export const DEFAULT_API_URL = 'http://localhost:5000/api';