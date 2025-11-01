import { District, User } from '../models/index.js';
import { DISTRICTS } from '../config/constants.js';
import { USER_ROLES } from '../config/constants.js';

const initializeDatabase = async () => {
  try {
    console.log('🚀 Database başlangıç verileri yükleniyor...');

    // İlçeleri kontrol et - yoksa ekle
    const existingDistricts = await District.count();
    
    if (existingDistricts === 0) {
      const districts = DISTRICTS.map((name, index) => ({
        name,
        code: `DIST_${(index + 1).toString().padStart(3, '0')}`,
        population: Math.floor(Math.random() * 50000) + 10000
      }));

      await District.bulkCreate(districts);
      console.log(`✅ ${districts.length} ilçe eklendi`);
    } else {
      console.log(`✅ ${existingDistricts} ilçe zaten mevcut`);
    }

    // Admin kullanıcıyı kontrol et - yoksa ekle
    const existingAdmin = await User.findOne({ 
      where: { phone: '5551234567' } 
    });
    
    if (!existingAdmin) {
      await User.create({
        name: 'Admin',
        surname: 'User',
        phone: '5551234567',
        password: 'admin123',
        districtId: 1,
        role: USER_ROLES.SUPER_ADMIN,
        isActive: true
      });
      console.log('✅ Admin kullanıcı oluşturuldu');
    } else {
      console.log('✅ Admin kullanıcı zaten mevcut');
    }

    // İlçe başkanını kontrol et - yoksa ekle
    const existingIlceBaskani = await User.findOne({ 
      where: { phone: '5551234568' } 
    });
    
    if (!existingIlceBaskani) {
      await User.create({
        name: 'İlçe',
        surname: 'Başkanı',
        phone: '5551234568',
        password: 'ilce123',
        districtId: 1,
        role: USER_ROLES.ILCE_BASKANI,
        isActive: true
      });
      console.log('✅ İlçe başkanı oluşturuldu');
    } else {
      console.log('✅ İlçe başkanı zaten mevcut');
    }

    console.log('🎉 Database başlangıç verileri tamamlandı!');
    
  } catch (error) {
    console.error('❌ Database başlatma hatası:', error);
    throw error;
  }
};

export default initializeDatabase;