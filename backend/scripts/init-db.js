// initializeDatabase.js - İSİMLER DÜZELTİLDİ

import { District, User } from '../models/index.js';
import { DISTRICTS, USER_ROLES } from '../config/constants.js';

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

    // Tüm ilçeleri getir
    const allDistricts = await District.findAll();

    // Admin kullanıcıyı kontrol et - yoksa ekle
    const existingAdmin = await User.findOne({ where: { phone: '5551234567' } });
    if (!existingAdmin) {
      await User.create({
        name: 'Admin',
        surname: 'User',
        phone: '5551234567',
        password: 'admin123',
        districtId: 1, // Çankaya
        role: USER_ROLES.SUPER_ADMIN,
        isActive: true
      });
      console.log('✅ Admin kullanıcı oluşturuldu');
    } else {
      console.log('✅ Admin kullanıcı zaten mevcut');
    }

    // İLÇE BAŞKANLARI OLUŞTUR (DOĞRU İSİMLERLE)
    const districtPresidents = [
      // İLÇE BAŞKANI İSİMLERİ DÜZELTİLDİ
      { name: 'Mehmet', surname: 'Yılmaz', phone: '5551234568', districtId: 1, districtName: 'Çankaya' },
      { name: 'Ahmet', surname: 'Kaya', phone: '5551234569', districtId: 2, districtName: 'Keçiören' },
      { name: 'Ayşe', surname: 'Demir', phone: '5551234570', districtId: 3, districtName: 'Yenimahalle' },
      { name: 'Fatma', surname: 'Şahin', phone: '5551234571', districtId: 4, districtName: 'Mamak' },
      { name: 'Mustafa', surname: 'Öztürk', phone: '5551234572', districtId: 5, districtName: 'Altındağ' },
      { name: 'Zeynep', surname: 'Çelik', phone: '5551234573', districtId: 6, districtName: 'Etimesgut' }
    ];

    for (const president of districtPresidents) {
      const existingPresident = await User.findOne({ 
        where: { phone: president.phone } 
      });
      
      if (!existingPresident) {
        await User.create({
          name: president.name,
          surname: president.surname,
          phone: president.phone,
          password: 'ilce123',
          districtId: president.districtId,
          role: USER_ROLES.ILCE_BASKANI,
          isActive: true
        });
        console.log(`✅ ${president.name} ${president.surname} - ${president.districtName} İlçe Başkanı oluşturuldu`);
      } else {
        console.log(`✅ ${president.name} ${president.surname} - ${president.districtName} İlçe Başkanı zaten mevcut`);
      }
    }

   // TEST GÖNÜLLÜLER OLUŞTUR - PROFİL BİLGİLERİ EKLE
console.log('👥 Test gönüllüler oluşturuluyor...');

const testVolunteers = [
  // Çankaya'daki gönüllüler
  { 
    name: 'Emre', 
    surname: 'Crd', 
    phone: '5537934281', 
    districtId: 1, 
    districtName: 'Çankaya',
    profession: 'Yazılım Mühendisi',
    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
    educationLevel: 'university',
    company: 'TechCorp',
    position: 'Senior Developer',
    workExperience: 5,
    gender: 'male',
    birthDate: '1990-05-15',
    birthPlace: 'Ankara',
    bloodType: 'a_positive',
    maritalStatus: 'single',
    address: 'Çankaya, Ankara'
  },
  
  { 
    name: 'Ali', 
    surname: 'Arslan', 
    phone: '5537934282', 
    districtId: 1, 
    districtName: 'Çankaya',
    profession: 'Doktor',
    skills: ['Tıbbi Tanı', 'Hasta Bakımı', 'Acil Müdahale'],
    educationLevel: 'university',
    company: 'Ankara Hastanesi',
    position: 'Başhekim',
    workExperience: 10,
    gender: 'male',
    birthDate: '1985-08-20',
    birthPlace: 'İstanbul',
    bloodType: 'o_positive',
    maritalStatus: 'married',
    address: 'Çankaya, Ankara'
  },
  
  { 
    name: 'Seda', 
    surname: 'Yıldız', 
    phone: '5537934283', 
    districtId: 1, 
    districtName: 'Çankaya',
    profession: 'Öğretmen',
    skills: ['Eğitim Planlama', 'Öğrenci Koçluğu', 'Eğitim Teknolojileri'],
    educationLevel: 'master',
    company: 'MEB',
    position: 'Matematik Öğretmeni',
    workExperience: 8,
    gender: 'female',
    birthDate: '1988-03-10',
    birthPlace: 'İzmir',
    bloodType: 'b_positive',
    maritalStatus: 'married',
    address: 'Çankaya, Ankara'
  },
  
  // Keçiören
  { 
    name: 'Mehmet', 
    surname: 'Kaya', 
    phone: '5537934284', 
    districtId: 2, 
    districtName: 'Keçiören',
    profession: 'Mimar',
    skills: ['AutoCAD', '3D Modelleme', 'Proje Yönetimi'],
    educationLevel: 'university',
    company: 'MimProje',
    position: 'Proje Müdürü',
    workExperience: 7,
    gender: 'male',
    birthDate: '1987-11-25',
    birthPlace: 'Ankara',
    bloodType: 'ab_positive',
    maritalStatus: 'married',
    address: 'Keçiören, Ankara'
  },
  
  { 
    name: 'Elif', 
    surname: 'Koç', 
    phone: '5537934285', 
    districtId: 2, 
    districtName: 'Keçiören',
    profession: 'Avukat',
    skills: ['Hukuki Danışmanlık', 'Dava Takibi', 'Sözleşme Hazırlama'],
    educationLevel: 'university',
    company: 'Hukuk Bürosu',
    position: 'Avukat',
    workExperience: 4,
    gender: 'female',
    birthDate: '1990-03-25',
    birthPlace: 'Ankara',
    bloodType: 'b_positive',
    maritalStatus: 'married',
    address: 'Keçiören, Ankara'
  },
  
  // Yenimahalle
  { 
    name: 'Fatma', 
    surname: 'Şahin', 
    phone: '5537934286', 
    districtId: 3, 
    districtName: 'Yenimahalle',
    profession: 'Muhasebeci',
    skills: ['Finansal Raporlama', 'Vergi Mevzuatı', 'Bütçe Planlama'],
    educationLevel: 'university',
    company: 'Muhasebe Ofisi',
    position: 'Muhasebe Müdürü',
    workExperience: 9,
    gender: 'female',
    birthDate: '1983-06-18',
    birthPlace: 'Ankara',
    bloodType: 'a_negative',
    maritalStatus: 'married',
    address: 'Yenimahalle, Ankara'
  },
  
  // Mamak
  { 
    name: 'Mustafa', 
    surname: 'Öztürk', 
    phone: '5537934287', 
    districtId: 4, 
    districtName: 'Mamak',
    profession: 'İnşaat Mühendisi',
    skills: ['Proje Yönetimi', 'AutoCAD', 'Şantiye Yönetimi'],
    educationLevel: 'university',
    company: 'İnşaat A.Ş.',
    position: 'Proje Müdürü',
    workExperience: 11,
    gender: 'male',
    birthDate: '1980-09-30',
    birthPlace: 'Ankara',
    bloodType: 'o_positive',
    maritalStatus: 'married',
    address: 'Mamak, Ankara'
  },
  
  { 
    name: 'Zeynep', 
    surname: 'Çelik', 
    phone: '5537934288', 
    districtId: 4, 
    districtName: 'Mamak',
    profession: 'Hemşire',
    skills: ['Hasta Bakımı', 'Acil Müdahale', 'İlk Yardım'],
    educationLevel: 'university',
    company: 'Ankara Hastanesi',
    position: 'Başhemşire',
    workExperience: 8,
    gender: 'female',
    birthDate: '1986-12-05',
    birthPlace: 'Ankara',
    bloodType: 'ab_negative',
    maritalStatus: 'married',
    address: 'Mamak, Ankara'
  },
  
  // Altındağ
  { 
    name: 'Hasan', 
    surname: 'Yılmaz', 
    phone: '5537934289', 
    districtId: 5, 
    districtName: 'Altındağ',
    profession: 'Öğretmen',
    skills: ['Eğitim Teknolojileri', 'Öğrenci Koçluğu', 'Müfredat Geliştirme'],
    educationLevel: 'master',
    company: 'MEB',
    position: 'Okul Müdürü',
    workExperience: 15,
    gender: 'male',
    birthDate: '1978-04-22',
    birthPlace: 'Ankara',
    bloodType: 'b_positive',
    maritalStatus: 'married',
    address: 'Altındağ, Ankara'
  },
  
  // Etimesgut - SENİN İLÇEN
  { 
    name: 'Gül', 
    surname: 'Demir', 
    phone: '5537934290', 
    districtId: 6, 
    districtName: 'Etimesgut',
    profession: 'Avukat',
    skills: ['Hukuki Danışmanlık', 'Dava Takibi', 'Sözleşme Hazırlama'],
    educationLevel: 'university',
    company: 'Hukuk Bürosu',
    position: 'Ortak Avukat',
    workExperience: 6,
    gender: 'female',
    birthDate: '1989-07-14',
    birthPlace: 'Ankara',
    bloodType: 'a_positive',
    maritalStatus: 'single',
    address: 'Etimesgut, Ankara',
    emergencyContact: 'Mehmet Demir',
    emergencyPhone: '5551234888',
    bio: 'Hukuk alanında 6 yıllık deneyim. Ticaret hukuku ve sözleşme hukuku konularında uzman.'
  },
  
  { 
    name: 'Kaan', 
    surname: 'Aydın', 
    phone: '5537934291', 
    districtId: 6, 
    districtName: 'Etimesgut',
    profession: 'İnşaat Mühendisi',
    skills: ['Proje Yönetimi', 'AutoCAD', 'Şantiye Yönetimi', 'İş Güvenliği'],
    educationLevel: 'university',
    company: 'İnşaat A.Ş.',
    position: 'Şantiye Şefi',
    workExperience: 6,
    gender: 'male',
    birthDate: '1992-07-12',
    birthPlace: 'Ankara',
    bloodType: 'a_positive',
    maritalStatus: 'single',
    address: 'Etimesgut, Ankara',
    emergencyContact: 'Ahmet Aydın',
    emergencyPhone: '5551234999',
    bio: 'İnşaat sektöründe 6 yıllık deneyim. Proje yönetimi ve şantiye organizasyonu konularında uzman.'
  }
];

for (const volunteer of testVolunteers) {
  const existingVolunteer = await User.findOne({ 
    where: { phone: volunteer.phone } 
  });
  
  if (!existingVolunteer) {
    // YENİ KULLANICI OLUŞTUR
    await User.create({
      name: volunteer.name,
      surname: volunteer.surname,
      phone: volunteer.phone,
      password: '111111',
      districtId: volunteer.districtId,
      role: USER_ROLES.GONULLU,
      isActive: true,
      // ✅ YENİ: PROFİL BİLGİLERİ EKLE
      profession: volunteer.profession,
      skills: volunteer.skills,
      educationLevel: volunteer.educationLevel,
      company: volunteer.company,
      position: volunteer.position,
      workExperience: volunteer.workExperience,
      gender: volunteer.gender,
      birthDate: volunteer.birthDate,
      birthPlace: volunteer.birthPlace,
      bloodType: volunteer.bloodType,
      maritalStatus: volunteer.maritalStatus,
      address: volunteer.address,
      emergencyContact: volunteer.emergencyContact,
      emergencyPhone: volunteer.emergencyPhone,
      bio: volunteer.bio
    });
    console.log(`✅ ${volunteer.name} ${volunteer.surname} - ${volunteer.districtName} gönüllüsü oluşturuldu (${volunteer.profession})`);
  } else {
    console.log(`✅ ${volunteer.name} ${volunteer.surname} gönüllü zaten mevcut`);
    
    // ✅ MEVCUT KULLANICILARI GÜNCELLE
    await existingVolunteer.update({
      profession: volunteer.profession || existingVolunteer.profession,
      skills: volunteer.skills || existingVolunteer.skills,
      educationLevel: volunteer.educationLevel || existingVolunteer.educationLevel,
      company: volunteer.company || existingVolunteer.company,
      position: volunteer.position || existingVolunteer.position,
      workExperience: volunteer.workExperience || existingVolunteer.workExperience,
      gender: volunteer.gender || existingVolunteer.gender,
      birthDate: volunteer.birthDate || existingVolunteer.birthDate,
      birthPlace: volunteer.birthPlace || existingVolunteer.birthPlace,
      bloodType: volunteer.bloodType || existingVolunteer.bloodType,
      maritalStatus: volunteer.maritalStatus || existingVolunteer.maritalStatus,
      address: volunteer.address || existingVolunteer.address,
      emergencyContact: volunteer.emergencyContact || existingVolunteer.emergencyContact,
      emergencyPhone: volunteer.emergencyPhone || existingVolunteer.emergencyPhone,
      bio: volunteer.bio || existingVolunteer.bio
    });
    console.log(`🔄 ${volunteer.name} ${volunteer.surname} profili güncellendi (${volunteer.profession})`);
  }
}
  } catch (error) {
    console.error('❌ Database başlatma hatası:', error);
    throw error;
  }
};

export default initializeDatabase;