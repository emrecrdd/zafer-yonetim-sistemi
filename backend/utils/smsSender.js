// Basit SMS simülasyonu - Gerçek SMS API entegrasyonu için hazır
export const sendSMS = async (phone, message) => {
  try {
    console.log(`📱 SMS Gönderiliyor: ${phone} - ${message}`);
    
    // Gerçek SMS servisi entegrasyonu buraya gelecek
    // Örnek: Twilio, NetGSM, etc.
    
    return { success: true, message: 'SMS gönderildi' };
  } catch (error) {
    console.error('SMS gönderme hatası:', error);
    return { success: false, error: error.message };
  }
};

export const sendWelcomeSMS = async (phone, name, password) => {
  const message = `Sayın ${name}, Zafer Partisi gönüllü sistemine hoş geldiniz! Giriş bilgileriniz: Telefon: ${phone}, Şifre: ${password}. Sistem: http://localhost:3000`;
  return await sendSMS(phone, message);
};

export const sendEventReminder = async (phone, eventTitle, eventDate) => {
  const message = `Hatırlatma: ${eventTitle} etkinliği ${new Date(eventDate).toLocaleDateString('tr-TR')} tarihinde. Katılım durumunuzu bildirin.`;
  return await sendSMS(phone, message);
};